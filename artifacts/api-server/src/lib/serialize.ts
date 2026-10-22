import type {
  AdminUserRow,
  BarberRow,
  BookingRow,
  CampaignRow,
  EventRow,
  LandingPageRow,
  ServiceRow,
  SiteSettingsRow,
  TestimonialRow,
} from "@workspace/db";

const iso = (d: Date) => d.toISOString();

export function serializeSettings(s: SiteSettingsRow) {
  const { id: _id, updatedAt, ...rest } = s;
  return { ...rest, updatedAt: iso(updatedAt) };
}

export function serializeBarber(b: BarberRow, opts: { publicView: boolean }) {
  return {
    ...b,
    notableClients: opts.publicView
      ? b.notableClients.filter((c) => c.consent === true).map((c) => ({ name: c.name, consent: true, note: c.note ?? null }))
      : b.notableClients.map((c) => ({ name: c.name, consent: c.consent, note: c.note ?? null })),
    createdAt: iso(b.createdAt),
    updatedAt: iso(b.updatedAt),
  };
}

export function serializeService(s: ServiceRow) {
  return { ...s, updatedAt: iso(s.updatedAt) };
}

export function serializeTestimonial(t: TestimonialRow) {
  const { displayOrder: _o, ...rest } = t;
  return rest;
}

export function serializeLandingPage(p: LandingPageRow) {
  return { ...p, createdAt: iso(p.createdAt), updatedAt: iso(p.updatedAt) };
}

export function serializeEvent(e: EventRow, barberName: string | null) {
  return {
    id: e.id,
    type: e.type,
    sessionId: e.sessionId,
    path: e.path,
    barberId: e.barberId,
    barberName,
    landingPageSlug: e.landingPageSlug,
    variant: e.variant,
    utmSource: e.utmSource,
    utmCampaign: e.utmCampaign,
    gclid: e.gclid,
    fbclid: e.fbclid,
    createdAt: iso(e.createdAt),
  };
}

export function serializeBooking(b: BookingRow, barberName: string | null) {
  return { ...b, barberName, bookedAt: iso(b.bookedAt), createdAt: iso(b.createdAt) };
}

export function serializeCampaign(c: CampaignRow, barberName: string | null) {
  return { ...c, barberName, createdAt: iso(c.createdAt) };
}

export function serializeAdmin(a: AdminUserRow) {
  return { ...a, createdAt: iso(a.createdAt) };
}

export function toDateString(d: Date | null | undefined): string | null | undefined {
  if (d === undefined) return undefined;
  if (d === null) return null;
  return d.toISOString().slice(0, 10);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
