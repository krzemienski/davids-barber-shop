import { and, count, eq, inArray, isNull, or, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import {
  adminUsersTable,
  barbersTable,
  db,
  landingPagesTable,
  servicesTable,
  siteSettingsTable,
  testimonialsTable,
  wallEntriesTable,
} from "@workspace/db";
import { DEFAULT_LISTING_URL } from "./googlePlaces";
import { logger } from "./logger";

// Starting content mirrors davidsbarbershop84.com as of October 2026. Every
// section is seeded only when its table is empty, so admin edits are never
// overwritten on restart or redeploy.

const HOURS = [
  { day: "Monday", open: "08:30", close: "19:00", closed: false },
  { day: "Tuesday", open: "08:30", close: "19:00", closed: false },
  { day: "Wednesday", open: "08:30", close: "19:00", closed: false },
  { day: "Thursday", open: "08:30", close: "19:00", closed: false },
  { day: "Friday", open: "08:30", close: "19:00", closed: false },
  { day: "Saturday", open: null, close: null, closed: true },
  { day: "Sunday", open: "09:00", close: "18:00", closed: false },
];

// The owner's price list (2026-11-05): haircut $30 walk-in / $35 booked, haircut & beard $45, no "Beard",
// crew cut $22 and royal shave with hot towel $35 added. booksyVariantId is Booksy's service ID, which opens the
// booking widget on that service; crew cut and royal shave are not on Booksy, so they are walk-in only.
type SeedService = {
  name: string;
  category: string;
  priceCents: number;
  walkInPriceCents?: number | null;
  durationMinutes: number | null;
  booksyVariantId: number | null;
  description: string;
  active?: boolean;
};
const SERVICES: SeedService[] = [
  { name: "Haircut", category: "Haircuts", priceCents: 3500, walkInPriceCents: 3000, durationMinutes: 25, booksyVariantId: 19748050, description: "A classic cut, tailored to how you wear it." },
  { name: "Crew cut", category: "Haircuts", priceCents: 2200, durationMinutes: null, booksyVariantId: null, description: "" },
  { name: "Haircut & beard", category: "Haircuts", priceCents: 4500, durationMinutes: 45, booksyVariantId: 19748052, description: "" },
  { name: "Line up", category: "Haircuts", priceCents: 2000, durationMinutes: 20, booksyVariantId: 19748055, description: "" },
  { name: "Beard trim", category: "Beards & shaves", priceCents: 2000, durationMinutes: 15, booksyVariantId: 19748059, description: "" },
  { name: "Royal shave with hot towel", category: "Beards & shaves", priceCents: 3500, durationMinutes: null, booksyVariantId: null, description: "" },
];
const OFFER_PRICE_CENTS = 3500;
const WALK_IN_PRICE_CENTS = 3000;

// The Booksy menu the site showed from 2026-11-03 to 2026-11-05. A database still holding exactly this menu
// gets the owner's price list.
const BOOKSY_MENU: [name: string, priceCents: number][] = [
  ["Haircut", 3500],
  ["Beard", 2000],
  ["Haircut & beard", 5500],
  ["Line up", 2000],
  ["Beard trim", 2000],
];

// The first menu, copied from the old website. A database still holding exactly this menu gets the Booksy menu.
const OLD_SERVICES: [name: string, priceCents: number, durationMinutes: number][] = [
  ["Haircut", 3000, 30],
  ["Shampoo & Cut", 3000, 40],
  ["Crew Cut", 2200, 25],
  ["Long Hair Cut", 2800, 40],
  ["Royal Shave", 2500, 30],
  ["Beard Trim", 1500, 15],
];
const OLD_OFFER_PRICE_CENTS = 3000;

const TESTIMONIALS = [
  { author: "James D.", barberName: "Sean", quote: "David's Barber Shop provides excellent service and friendly barbers who listen to your needs. After moving to Manhattan, I thought I'd never find another barber I liked like my last one in Queens. After my first cut with Sean, I knew I had found my new go-to barbershop. Would definitely recommend to anyone who wants quality haircuts and shaves." },
  { author: "Jimmy M.", barberName: "Sean", quote: "I've been going to David's to see Shawn since 2014. I can not recommend a better barbershop. Service is fast, the barbers are friendly, and the price is good. Every time I am there, I am treated like the only person in the place - even when it's busy, Shawn and the guys take their time to give you the best haircut possible. I now live in Queens and commute into the city because of all the barbers I've been to in my life, I trust no one more than Shawn." },
  { author: "Neil S.", barberName: "Sean", quote: "Best barbershop in NYC hands down. I've been going to them for 7+ years and I would travel to get a haircut from Long Island. Sean is the best barber around. They vibe is chill and the employees are great to hang with. They remember your cut and knows how to adjust to whatever hairstyle you want." },
  { author: "Bryce T.", barberName: null, quote: "Been a UES local for the better part of 8 years. As an AM person, David's Barber Shop is open, welcoming, and friendly. Great way to start the day with a great fresh cut and feeling good! Definitely recommend!" },
  { author: "Justin S.", barberName: null, quote: "Been going to David's for over a year now and absolutely love it. I don't even have a regular barber, I just go in and take whoever's available and they always give me a good cut. Everyone's super friendly and very reasonably priced." },
  { author: "José S.", barberName: null, quote: "Best Barbershop in NYC! I literally reside in East Harlem but I always take my car and do the 15 min drive to there guys cause they always provide excellent customer service since the first time I walked in 1 year ago! The wait isn't bad but then again that lets you know how many people trust them and are willing to wait for them for their haircut!" },
  { author: "Adi B.", barberName: null, quote: "Great place will go again. It was a really nice experience. And the price is fair. The barbers are also very nice" },
  { author: "Chris R.", barberName: "Sean", quote: "Sean and his team have always been welcoming and masters of their craft - I even bring my father in law from Queens here because I trust and like them the best. No matter where I live in the city will always come here, like family!" },
];

// Restored scans of the framed photos on the shop wall (originals in
// attached_assets/, restored copies in attached_assets/wall-restored/), uploaded
// to private object storage under unguessable names. Seeded as drafts: nothing
// is public until the owner records permission. No years are guessed.
const WALL_DRAFTS = [
  {
    photoUrl: "/api/storage/objects/wall/72cd0a03-40cd-4c16-9982-caab2f7badae.jpg",
    caption: "The shop's name and address on screen during a haircut segment on Good Day New York.",
    people: [] as string[],
    pressOutlet: "FOX 5 Good Day New York",
  },
  {
    photoUrl: "/api/storage/objects/wall/3f1ef7cd-2d53-4090-9fbc-efa6c8d84ff0.jpg",
    caption: "A signed #22 photo, taken in the shop doorway.",
    people: ["Jacoby Ellsbury"],
    pressOutlet: null,
  },
  {
    photoUrl: "/api/storage/objects/wall/b88fe06c-8bc2-4bca-86af-32d00ecfdc0b.jpg",
    caption: "Aaron Judge in the chair, with a selfie in the mirror. Signed for the shop wall.",
    people: ["Aaron Judge"],
    pressOutlet: null,
  },
  {
    photoUrl: "/api/storage/objects/wall/4621df81-eb25-4209-bb6c-8ed6506077fb.jpg",
    caption: "Carlos Beltran outside the shop on East 84th Street.",
    people: ["Carlos Beltran"],
    pressOutlet: null,
  },
];

// The Maps link seeded before the real listing was known. Replaced only while it is still this exact value.
const OLD_DEFAULT_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=233+E+84th+St,+New+York,+NY+10028";

// Copy corrected in the brand and content audit. Existing rows are updated only while they still hold the old text,
// so edits made in the admin are never overwritten.
const SEAN_BIO = "The name that comes up most in our reviews. Clients travel in from Queens and Long Island to keep their barber.";
const OLD_SEAN_BIO = "The name that comes up most in our reviews. Clients travel in from Queens and Long Island to keep their standing appointment with Sean.";
const OFFER_SUBHEADLINE = "Cutting hair on East 84th Street since 1972. Book online or call the shop.";
const OLD_OFFER_SUBHEADLINE = "Cutting hair on East 84th Street since 1972. Book online in under a minute.";
// Variant B tests one thing at a time: the headline. A null B subheadline reuses variant A's.
const OLD_OFFER_B_SUBHEADLINE = "Father-and-son shop, cutting since 1972. Book your chair now.";
const barberBHeadline = (name: string) => `Your next cut, with ${name}.`;
// "…without the Upper East Side price" is a comparison claim; comparisons stay off until the owner approves them.
const OLD_OFFER_B_HEADLINE = "A real Upper East Side barber, without the Upper East Side price.";
const OFFER_B_HEADLINE = "A real Upper East Side barber. Since 1972.";
const OFFER_SLUG = "35-dollar-cut";
const OFFER_HEADLINE = "Manhattan quality. $35 a cut.";
const OLD_OFFER_SLUG = "30-dollar-cut";
const OLD_OFFER_HEADLINE = "Manhattan quality. $30 a cut.";
// Booksy has no shave, so the shave ad page and David's "Royal shave" specialty were retired with the old menu.
const OLD_DAVID_SPECIALTIES = ["Classic cuts", "Royal shave"];
const DAVID_SPECIALTIES = ["Classic cuts"];

// The roster as on Booksy listing 1663005; the owner confirmed on 2026-11-03 that only these three work at the shop.
// booksyStafferId opens Booksy on that barber. Photos are the owner's headshots (2026-11-05), served from the site's
// public media folder.
const ROSTER = [
  { slug: "michael", name: "Michael", booksyStafferId: 1582201, photoUrl: "/media/barbers/michael.jpg" },
  { slug: "russel", name: "Russel", booksyStafferId: 1869365, photoUrl: "/media/barbers/russel.jpg" },
  { slug: "alex", name: "Alex", booksyStafferId: 1869419, photoUrl: "/media/barbers/alex.jpg" },
];
// Bios as the owner wrote them for Booksy (2026-11-06), with Russel spelled as on Booksy per the owner. Specialties
// and years are taken from the same text.
const ROSTER_PROFILES: Record<string, { bio: string; yearsCutting: number; specialties: string[] }> = {
  michael: {
    bio: "Hi, I’m Michael! I’ve been barbering for five years, working alongside my father, Alex, as part of our father-and-son team. I take pride in delivering clean, sharp haircuts while making sure every client feels comfortable and welcome. For me, barbering is about building relationships and making sure you leave looking and feeling your best.",
    yearsCutting: 5,
    specialties: ["Clean, sharp haircuts"],
  },
  russel: {
    bio: "Hi, I’m Russel! With five years of barbering experience, I specialize in all types of haircuts, from classic styles to modern fades. I’m known for my attention to detail, clean finishes, and ability to work with different hair types and styles. My goal is to give every client a great haircut, exceptional service, and a comfortable experience every time.",
    yearsCutting: 5,
    specialties: ["Classic styles", "Modern fades"],
  },
  alex: {
    bio: "Hi, I’m Alex! Originally from Russia, I bring 15 years of barbering experience and a passion for traditional craftsmanship. Working alongside my son, Michael, makes our barbershop feel like a true family business. I specialize in precise, classic cuts and personalized service, always making sure every client leaves looking sharp and satisfied.",
    yearsCutting: 15,
    specialties: ["Precise, classic cuts", "Personalized service"],
  },
};
// The first roster, copied from the old website.
const OLD_ROSTER_SLUGS = ["david", "sean"];
const BARBER_SUBHEADLINE = "Pick a time on Booksy, or call the shop and we will fit you in.";
const barberLandingPage = (b: { id: number; slug: string; name: string }) => ({
  slug: `book-${b.slug}`,
  kind: "barber" as const,
  barberId: b.id,
  headline: `Book with ${b.name}.`,
  subheadline: BARBER_SUBHEADLINE,
  variantBHeadline: barberBHeadline(b.name),
});

// Landing pages for the ad creative kit (docs/ads/AD_CREATIVE.md). Each is added only while its slug is
// missing, so a fresh or production database gets them too. To retire one, switch it off in the admin;
// a deleted kit page is added back on the next restart.
const AD_KIT_PAGES = [
  {
    slug: "upper-east-side-barber",
    kind: "offer" as const,
    serviceName: null,
    headline: "Your Upper East Side barber. Since 1972.",
    subheadline: "A father-and-son shop between Second and Third Avenue. Book online or call the shop.",
    variantBHeadline: "The barber on East 84th Street. Since 1972.",
  },
];

async function isEmpty(table: PgTable): Promise<boolean> {
  const [{ n }] = await db.select({ n: count() }).from(table);
  return n === 0;
}

export async function seedDatabase(): Promise<void> {
  const [settings] = await db.select({ id: siteSettingsTable.id }).from(siteSettingsTable).where(eq(siteSettingsTable.id, 1));
  if (!settings) {
    await db.insert(siteSettingsTable).values({
      id: 1,
      shopName: "David's Barber Shop",
      foundedYear: 1972,
      phone: "+12128619179",
      email: "info@davidsbarbershop.com",
      streetAddress: "233 East 84th Street",
      city: "New York",
      region: "NY",
      postalCode: "10028",
      hours: HOURS,
      offerPriceCents: OFFER_PRICE_CENTS,
      walkInPriceCents: WALK_IN_PRICE_CENTS,
      comparisonPriceCents: null,
      comparisonSourceNote: null,
      announcementBanner: null,
      booksyBusinessUrl: "https://booksy.com/en-us/1663005_davids-barbershop_barber-shop_30067_new-york-city",
      booksyBusinessId: 1663005,
      instagramUrl: null,
      googleMapsUrl: DEFAULT_LISTING_URL,
    });
    logger.info("Seeded site settings");
  } else {
    const moved = await db
      .update(siteSettingsTable)
      .set({ googleMapsUrl: DEFAULT_LISTING_URL, updatedAt: new Date() })
      .where(and(eq(siteSettingsTable.id, 1), eq(siteSettingsTable.googleMapsUrl, OLD_DEFAULT_MAPS_URL)))
      .returning({ id: siteSettingsTable.id });
    if (moved.length > 0) logger.info("Pointed the Google Maps link at the shop's listing");
  }

  const bio = await db.update(barbersTable).set({ bio: SEAN_BIO, updatedAt: new Date() }).where(eq(barbersTable.bio, OLD_SEAN_BIO)).returning({ id: barbersTable.id });
  const sub = await db
    .update(landingPagesTable)
    .set({ subheadline: OFFER_SUBHEADLINE, updatedAt: new Date() })
    .where(eq(landingPagesTable.subheadline, OLD_OFFER_SUBHEADLINE))
    .returning({ id: landingPagesTable.id });
  const offerB = await db
    .update(landingPagesTable)
    .set({ variantBSubheadline: null, updatedAt: new Date() })
    .where(and(eq(landingPagesTable.slug, OLD_OFFER_SLUG), eq(landingPagesTable.variantBSubheadline, OLD_OFFER_B_SUBHEADLINE)))
    .returning({ id: landingPagesTable.id });
  const offerBHead = await db
    .update(landingPagesTable)
    .set({ variantBHeadline: OFFER_B_HEADLINE, updatedAt: new Date() })
    .where(and(eq(landingPagesTable.slug, OLD_OFFER_SLUG), eq(landingPagesTable.variantBHeadline, OLD_OFFER_B_HEADLINE)))
    .returning({ id: landingPagesTable.id });
  if (bio.length + sub.length + offerB.length + offerBHead.length > 0) logger.info("Applied audited copy corrections");

  if (await isEmpty(wallEntriesTable)) {
    await db.insert(wallEntriesTable).values(WALL_DRAFTS.map((w, i) => ({ ...w, permissionOnFile: false, displayOrder: i })));
    logger.info("Seeded From-the-wall drafts (all hidden until permission is recorded)");
  }

  if (await isEmpty(servicesTable)) {
    await db.insert(servicesTable).values(SERVICES.map((s, i) => ({ ...s, displayOrder: i })));
    logger.info("Seeded services");
  } else {
    await alignMenuWithBooksy();
    await applyOwnerPriceList();
  }

  if (await isEmpty(testimonialsTable)) {
    await db.insert(testimonialsTable).values(TESTIMONIALS.map((t, i) => ({ ...t, source: "Customer review", displayOrder: i })));
    logger.info("Seeded testimonials");
  }

  if (await isEmpty(barbersTable)) {
    const inserted = await db
      .insert(barbersTable)
      .values(ROSTER.map((b, i) => ({ ...b, displayOrder: i })))
      .returning();
    logger.info("Seeded barbers");

    if (await isEmpty(landingPagesTable)) {
      await db.insert(landingPagesTable).values([
        {
          slug: OFFER_SLUG,
          kind: "offer",
          barberId: null,
          headline: OFFER_HEADLINE,
          subheadline: OFFER_SUBHEADLINE,
          variantBHeadline: OFFER_B_HEADLINE,
        },
        ...inserted.map(barberLandingPage),
      ]);
      logger.info("Seeded landing pages");
    }
  }

  await seedAdKitLandingPages();
  await alignRosterWithBooksy();
  await addRosterPhotos();
  await fillRosterProfiles();

  const bootstrap = (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));
  if (bootstrap.length > 0 && (await isEmpty(adminUsersTable))) {
    await db.insert(adminUsersTable).values(bootstrap.map((email) => ({ email, role: "owner" as const })));
    logger.info({ count: bootstrap.length }, "Bootstrapped owner accounts from ADMIN_BOOTSTRAP_EMAILS");
  }
}

// Moves a database still holding the first (old website) menu and $30 offer to the Booksy menu and $35.
// Each step runs only while the old value is untouched, so admin edits are never overwritten.
async function alignMenuWithBooksy(): Promise<void> {
  const rows = await db
    .select({ name: servicesTable.name, priceCents: servicesTable.priceCents, durationMinutes: servicesTable.durationMinutes })
    .from(servicesTable);
  const untouched =
    rows.length === OLD_SERVICES.length &&
    OLD_SERVICES.every(([name, price, mins]) => rows.some((r) => r.name === name && r.priceCents === price && r.durationMinutes === mins));
  if (untouched) {
    await db.transaction(async (tx) => {
      await tx.delete(servicesTable);
      await tx.insert(servicesTable).values(SERVICES.map((s, i) => ({ ...s, displayOrder: i })));
      await tx
        .update(landingPagesTable)
        .set({ active: false, updatedAt: new Date() })
        .where(and(eq(landingPagesTable.slug, "hot-towel-shave"), eq(landingPagesTable.kind, "service")));
    });
    logger.info("Replaced the old menu with the Booksy menu and switched off the shave landing page");
  }

  const price = await db
    .update(siteSettingsTable)
    .set({ offerPriceCents: OFFER_PRICE_CENTS, updatedAt: new Date() })
    .where(and(eq(siteSettingsTable.id, 1), eq(siteSettingsTable.offerPriceCents, OLD_OFFER_PRICE_CENTS)))
    .returning({ id: siteSettingsTable.id });
  const offer = await db
    .update(landingPagesTable)
    .set({ slug: OFFER_SLUG, headline: OFFER_HEADLINE, updatedAt: new Date() })
    .where(and(eq(landingPagesTable.slug, OLD_OFFER_SLUG), eq(landingPagesTable.headline, OLD_OFFER_HEADLINE)))
    .returning({ id: landingPagesTable.id });
  const [david] = await db.select({ id: barbersTable.id, specialties: barbersTable.specialties }).from(barbersTable).where(eq(barbersTable.slug, "david"));
  let specialties = 0;
  if (david && JSON.stringify(david.specialties) === JSON.stringify(OLD_DAVID_SPECIALTIES)) {
    await db.update(barbersTable).set({ specialties: DAVID_SPECIALTIES, updatedAt: new Date() }).where(eq(barbersTable.id, david.id));
    specialties = 1;
  }
  if (price.length + offer.length + specialties > 0) logger.info("Moved the haircut offer to the Booksy price ($35)");
}

// Moves a database still holding the Booksy-only menu to the owner's price list (2026-11-05). "Beard" is switched
// off rather than deleted so past landing pages keep their service. Runs only while every Booksy-menu row is
// untouched, so admin edits are never overwritten.
async function applyOwnerPriceList(): Promise<void> {
  const rows = await db
    .select({ id: servicesTable.id, name: servicesTable.name, priceCents: servicesTable.priceCents, active: servicesTable.active, walkIn: servicesTable.walkInPriceCents })
    .from(servicesTable);
  const untouched =
    rows.length === BOOKSY_MENU.length &&
    BOOKSY_MENU.every(([name, price]) => rows.some((r) => r.name === name && r.priceCents === price && r.active && r.walkIn === null));
  if (untouched) {
    await db.transaction(async (tx) => {
      for (const [i, svc] of SERVICES.entries()) {
        const existing = rows.find((r) => r.name === svc.name);
        if (existing) {
          await tx
            .update(servicesTable)
            .set({ priceCents: svc.priceCents, walkInPriceCents: svc.walkInPriceCents ?? null, category: svc.category, displayOrder: i, updatedAt: new Date() })
            .where(eq(servicesTable.id, existing.id));
        } else {
          await tx.insert(servicesTable).values({ ...svc, displayOrder: i });
        }
      }
      await tx.update(servicesTable).set({ active: false, category: "Beards & shaves", updatedAt: new Date() }).where(eq(servicesTable.name, "Beard"));
    });
    logger.info("Applied the owner's price list (walk-in $30, crew cut, royal shave; Beard switched off)");
  }

  const walkIn = await db
    .update(siteSettingsTable)
    .set({ walkInPriceCents: WALK_IN_PRICE_CENTS, updatedAt: new Date() })
    .where(and(eq(siteSettingsTable.id, 1), eq(siteSettingsTable.offerPriceCents, OFFER_PRICE_CENTS), isNull(siteSettingsTable.walkInPriceCents)))
    .returning({ id: siteSettingsTable.id });
  if (walkIn.length > 0) logger.info("Set the walk-in haircut price ($30)");
}

// Moves a database still showing the old website's roster (David and Sean, both active) to the Booksy roster.
// The old barbers and their landing pages are switched off, not deleted, so past bookings and events keep their
// barber. Runs only while exactly the old roster is active, so admin edits are never overwritten.
async function alignRosterWithBooksy(): Promise<void> {
  const active = await db.select({ slug: barbersTable.slug }).from(barbersTable).where(eq(barbersTable.active, true));
  const untouched = active.length === OLD_ROSTER_SLUGS.length && OLD_ROSTER_SLUGS.every((s) => active.some((a) => a.slug === s));
  if (!untouched) return;
  await db.transaction(async (tx) => {
    const old = await tx
      .update(barbersTable)
      .set({ active: false, updatedAt: new Date() })
      .where(inArray(barbersTable.slug, OLD_ROSTER_SLUGS))
      .returning({ id: barbersTable.id });
    await tx
      .update(landingPagesTable)
      .set({ active: false, updatedAt: new Date() })
      .where(and(eq(landingPagesTable.kind, "barber"), inArray(landingPagesTable.barberId, old.map((o) => o.id))));
    const inserted = await tx
      .insert(barbersTable)
      .values(ROSTER.map((b, i) => ({ ...b, displayOrder: i })))
      .onConflictDoNothing({ target: barbersTable.slug })
      .returning();
    if (inserted.length > 0) await tx.insert(landingPagesTable).values(inserted.map(barberLandingPage)).onConflictDoNothing();
  });
  logger.info("Switched the roster to the Booksy barbers (Michael, Russel, Alex)");
}

// Gives each roster barber the owner's headshot while they still have no photo; photos set in the admin win.
async function addRosterPhotos(): Promise<void> {
  let added = 0;
  for (const b of ROSTER) {
    const rows = await db
      .update(barbersTable)
      .set({ photoUrl: b.photoUrl, updatedAt: new Date() })
      .where(and(eq(barbersTable.slug, b.slug), or(isNull(barbersTable.photoUrl), eq(barbersTable.photoUrl, ""))))
      .returning({ id: barbersTable.id });
    added += rows.length;
  }
  if (added > 0) logger.info({ count: added }, "Added barber headshots");
}

// Fills in the owner's bios only for barbers whose bio, years and specialties are all still empty, so anything
// entered in admin is never overwritten. Photos are handled by addRosterPhotos.
async function fillRosterProfiles(): Promise<void> {
  let filled = 0;
  for (const [slug, profile] of Object.entries(ROSTER_PROFILES)) {
    const rows = await db
      .update(barbersTable)
      .set({ ...profile, updatedAt: new Date() })
      .where(
        and(
          eq(barbersTable.slug, slug),
          eq(barbersTable.bio, ""),
          isNull(barbersTable.yearsCutting),
          sql`${barbersTable.specialties} = '[]'::jsonb`,
        ),
      )
      .returning({ id: barbersTable.id });
    filled += rows.length;
  }
  if (filled > 0) logger.info({ count: filled }, "Added the owner's barber profiles");
}

async function seedAdKitLandingPages(): Promise<void> {
  // Barber pages seeded before variant B existed get the one-variable headline test, unless edited since.
  const barbers = await db.select({ id: barbersTable.id, name: barbersTable.name }).from(barbersTable);
  let testsAdded = 0;
  for (const b of barbers) {
    const rows = await db
      .update(landingPagesTable)
      .set({ variantBHeadline: barberBHeadline(b.name), updatedAt: new Date() })
      .where(
        and(
          eq(landingPagesTable.barberId, b.id),
          eq(landingPagesTable.kind, "barber"),
          eq(landingPagesTable.headline, `Book with ${b.name}.`),
          isNull(landingPagesTable.variantBHeadline),
        ),
      )
      .returning({ id: landingPagesTable.id });
    testsAdded += rows.length;
  }
  if (testsAdded > 0) logger.info({ count: testsAdded }, "Added variant B headlines to barber landing pages");

  for (const page of AD_KIT_PAGES) {
    const [existing] = await db.select({ id: landingPagesTable.id }).from(landingPagesTable).where(eq(landingPagesTable.slug, page.slug));
    if (existing) continue;
    let serviceId: number | null = null;
    if (page.serviceName) {
      const [svc] = await db.select({ id: servicesTable.id }).from(servicesTable).where(eq(servicesTable.name, page.serviceName));
      if (!svc) {
        logger.warn({ slug: page.slug, service: page.serviceName }, "Skipped ad landing page: its service is missing");
        continue;
      }
      serviceId = svc.id;
    }
    const { serviceName: _s, ...values } = page;
    await db.insert(landingPagesTable).values({ ...values, serviceId }).onConflictDoNothing();
    logger.info({ slug: page.slug }, "Added ad landing page");
  }
}
