import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";
import { logger } from "./logger";

// Live photos from the shop's Google listing (Places API (New)).
//
// Rules (Google Maps Platform terms): the key stays on the server; photos and
// photo names are fetched live and never stored or cached. Only the Place ID
// is kept (in site settings), which Google explicitly allows.

const API = "https://places.googleapis.com/v1";
const TIMEOUT_MS = 6000;
export const MAX_PHOTOS = 6;

// The listing the owner shared: "David's Barber Shop, 233 E 84th St".
export const LISTING_CID = "3355011163649612090";
export const DEFAULT_LISTING_URL = `https://maps.google.com/?cid=${LISTING_CID}`;

// Daily ceilings keep the bill small and stop anyone looping the photo proxy.
// Place Details with only the `photos` field is billed at the free "IDs only"
// tier; each photo image is a billed Place Photo request.
const DAILY_LIMIT = { details: 400, media: 150, search: 5 } as const;
type Kind = keyof typeof DAILY_LIMIT;
const usage = { day: "", details: 0, media: 0, search: 0 };

function spend(kind: Kind): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (usage.day !== today) Object.assign(usage, { day: today, details: 0, media: 0, search: 0 });
  if (usage[kind] >= DAILY_LIMIT[kind]) {
    if (usage[kind] === DAILY_LIMIT[kind]) logger.warn({ kind }, "Google Places daily request ceiling reached");
    usage[kind] = DAILY_LIMIT[kind] + 1;
    return false;
  }
  usage[kind] += 1;
  return true;
}

export const googleKey = (): string | null => process.env.GOOGLE_MAPS_API_KEY?.trim() || null;

function cidOf(url: string | null | undefined): string | null {
  const m = url?.match(/[?&]cid=(\d+)/);
  return m ? m[1]! : null;
}

export type GoogleAttribution = { displayName: string; uri: string | null; photoUri: string | null };
export type GooglePhotoRef = { name: string; widthPx: number; heightPx: number; authorAttributions: GoogleAttribution[] };

type RawPhoto = {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: { displayName?: string; uri?: string; photoUri?: string }[];
};

/**
 * Finds the listing's Place ID once and stores it in site settings. The match
 * must point at the same listing as the configured Maps link (its CID), so a
 * similarly named shop can never be picked by mistake.
 */
async function resolvePlaceId(key: string, settings: typeof siteSettingsTable.$inferSelect): Promise<string | null> {
  if (!spend("search")) return null;
  const cid = cidOf(settings.googleMapsUrl) ?? LISTING_CID;
  const res = await fetch(`${API}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.googleMapsUri",
    },
    body: JSON.stringify({
      textQuery: `${settings.shopName}, ${settings.streetAddress}, ${settings.city}, ${settings.region} ${settings.postalCode}`,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Google text search failed with ${res.status}`);
  const body = (await res.json()) as { places?: { id?: string; googleMapsUri?: string }[] };
  const match = body.places?.find((p) => p.id && cidOf(p.googleMapsUri) === cid);
  if (!match?.id) {
    logger.warn({ candidates: body.places?.length ?? 0 }, "No Google result matched the listing CID; Place ID left empty");
    return null;
  }
  await db.update(siteSettingsTable).set({ googlePlaceId: match.id, updatedAt: new Date() }).where(eq(siteSettingsTable.id, 1));
  logger.info("Stored the Google Place ID for the shop listing");
  return match.id;
}

async function currentPlaceId(key: string): Promise<string | null> {
  const [settings] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.id, 1));
  if (!settings) return null;
  if (settings.googlePlaceId) return settings.googlePlaceId;
  return resolvePlaceId(key, settings);
}

let inFlight: Promise<{ placeId: string; photos: GooglePhotoRef[] } | null> | null = null;

async function loadPhotos(key: string): Promise<{ placeId: string; photos: GooglePhotoRef[] } | null> {
  const placeId = await currentPlaceId(key);
  if (!placeId) return null;
  if (!spend("details")) return null;
  const res = await fetch(`${API}/places/${encodeURIComponent(placeId)}`, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "photos" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Google place details failed with ${res.status}`);
  const body = (await res.json()) as { photos?: RawPhoto[] };
  const photos = (body.photos ?? [])
    .filter((p): p is RawPhoto & { name: string } => typeof p.name === "string")
    .slice(0, MAX_PHOTOS)
    .map((p) => ({
      name: p.name,
      widthPx: p.widthPx ?? 0,
      heightPx: p.heightPx ?? 0,
      authorAttributions: (p.authorAttributions ?? [])
        .filter((a) => a.displayName)
        .map((a) => ({ displayName: a.displayName!, uri: a.uri ?? null, photoUri: a.photoUri ?? null })),
    }));
  return { placeId, photos };
}

/** Live photo references for the listing, or null when unavailable. Concurrent callers share one request; nothing is kept afterwards. */
export async function listingPhotos(): Promise<{ placeId: string; photos: GooglePhotoRef[] } | null> {
  const key = googleKey();
  if (!key) return null;
  if (!inFlight) {
    inFlight = loadPhotos(key)
      .catch((err) => {
        logger.warn({ err: (err as Error).message }, "Could not load Google listing photos");
        return null;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/** Fetches one photo image from Google. Only names under the shop's own Place ID are accepted, so this cannot be used as an open proxy. */
export async function fetchListingPhoto(name: string, maxWidthPx: number): Promise<Response | null> {
  const key = googleKey();
  if (!key) return null;
  const [settings] = await db
    .select({ placeId: siteSettingsTable.googlePlaceId })
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.id, 1));
  const placeId = settings?.placeId;
  if (!placeId) return null;
  const prefix = `places/${placeId}/photos/`;
  if (!name.startsWith(prefix) || !/^[A-Za-z0-9_-]+$/.test(name.slice(prefix.length))) return null;
  if (!spend("media")) return null;
  const res = await fetch(`${API}/${name}/media?maxWidthPx=${maxWidthPx}`, {
    headers: { "X-Goog-Api-Key": key },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
    logger.warn({ status: res.status }, "Google photo request failed");
    return null;
  }
  return res;
}
