import { and, count, eq, isNull } from "drizzle-orm";
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

const SERVICES = [
  { name: "Haircut", category: "Haircuts", priceCents: 3000, durationMinutes: 30, description: "A classic cut, tailored to how you wear it." },
  { name: "Shampoo & Cut", category: "Haircuts", priceCents: 3000, durationMinutes: 40, description: "Shampoo, cut and finish." },
  { name: "Crew Cut", category: "Haircuts", priceCents: 2200, durationMinutes: 25, description: "Short, clean and even all over." },
  { name: "Long Hair Cut", category: "Haircuts", priceCents: 2800, durationMinutes: 40, description: "Shaping and length work for longer hair." },
  { name: "Royal Shave", category: "Shaves & Beards", priceCents: 2500, durationMinutes: 30, description: "A straight-razor shave with hot towels." },
  { name: "Beard Trim", category: "Shaves & Beards", priceCents: 1500, durationMinutes: 15, description: "Beard shaped, lined and tidied." },
];

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
  {
    slug: "hot-towel-shave",
    kind: "service" as const,
    serviceName: "Royal Shave",
    headline: "Hot towel shave. Straight razor.",
    subheadline: "A royal shave with hot towels on East 84th Street, since 1972. Book online or call the shop.",
    variantBHeadline: "A proper shave. Hot towels, straight razor.",
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
      offerPriceCents: 3000,
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
    .where(and(eq(landingPagesTable.slug, "30-dollar-cut"), eq(landingPagesTable.variantBSubheadline, OLD_OFFER_B_SUBHEADLINE)))
    .returning({ id: landingPagesTable.id });
  const offerBHead = await db
    .update(landingPagesTable)
    .set({ variantBHeadline: OFFER_B_HEADLINE, updatedAt: new Date() })
    .where(and(eq(landingPagesTable.slug, "30-dollar-cut"), eq(landingPagesTable.variantBHeadline, OLD_OFFER_B_HEADLINE)))
    .returning({ id: landingPagesTable.id });
  if (bio.length + sub.length + offerB.length + offerBHead.length > 0) logger.info("Applied audited copy corrections");

  if (await isEmpty(wallEntriesTable)) {
    await db.insert(wallEntriesTable).values(WALL_DRAFTS.map((w, i) => ({ ...w, permissionOnFile: false, displayOrder: i })));
    logger.info("Seeded From-the-wall drafts (all hidden until permission is recorded)");
  }

  if (await isEmpty(servicesTable)) {
    await db.insert(servicesTable).values(SERVICES.map((s, i) => ({ ...s, displayOrder: i })));
    logger.info("Seeded services");
  }

  if (await isEmpty(testimonialsTable)) {
    await db.insert(testimonialsTable).values(TESTIMONIALS.map((t, i) => ({ ...t, source: "Customer review", displayOrder: i })));
    logger.info("Seeded testimonials");
  }

  if (await isEmpty(barbersTable)) {
    const inserted = await db
      .insert(barbersTable)
      .values([
        {
          slug: "david",
          name: "David",
          title: "Owner",
          bio: "The David in David's Barber Shop. Regulars have been sitting in his chair on East 84th Street for years.",
          specialties: ["Classic cuts", "Royal shave"],
          displayOrder: 0,
        },
        {
          slug: "sean",
          name: "Sean",
          title: "Barber",
          bio: SEAN_BIO,
          specialties: ["Fades", "Scissor cuts", "Beard work"],
          displayOrder: 1,
        },
      ])
      .returning();
    logger.info("Seeded barbers");

    if (await isEmpty(landingPagesTable)) {
      await db.insert(landingPagesTable).values([
        {
          slug: "30-dollar-cut",
          kind: "offer",
          barberId: null,
          headline: "Manhattan quality. $30 a cut.",
          subheadline: OFFER_SUBHEADLINE,
          variantBHeadline: OFFER_B_HEADLINE,
        },
        ...inserted.map((b) => ({
          slug: `book-${b.slug}`,
          kind: "barber" as const,
          barberId: b.id,
          headline: `Book with ${b.name}.`,
          subheadline: "Pick a time on Booksy, or call the shop and we will fit you in.",
          variantBHeadline: barberBHeadline(b.name),
        })),
      ]);
      logger.info("Seeded landing pages");
    }
  }

  await seedAdKitLandingPages();

  const bootstrap = (process.env.ADMIN_BOOTSTRAP_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));
  if (bootstrap.length > 0 && (await isEmpty(adminUsersTable))) {
    await db.insert(adminUsersTable).values(bootstrap.map((email) => ({ email, role: "owner" as const })));
    logger.info({ count: bootstrap.length }, "Bootstrapped owner accounts from ADMIN_BOOTSTRAP_EMAILS");
  }
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
