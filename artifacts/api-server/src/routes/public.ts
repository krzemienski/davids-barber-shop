import { Router, type IRouter } from "express";
import { and, asc, eq } from "drizzle-orm";
import {
  barbersTable,
  db,
  eventsTable,
  landingPagesTable,
  servicesTable,
  siteSettingsTable,
  testimonialsTable,
} from "@workspace/db";
import { GetBarberParams, GetLandingPageParams, TrackEventBody } from "@workspace/api-zod";
import {
  serializeBarber,
  serializeLandingPage,
  serializeService,
  serializeSettings,
  serializeTestimonial,
} from "../lib/serialize";

const router: IRouter = Router();

router.get("/site", async (_req, res) => {
  const [settings] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.id, 1));
  if (!settings) {
    res.status(500).json({ error: "Site settings have not been initialized" });
    return;
  }
  res.json(serializeSettings(settings));
});

router.get("/barbers", async (_req, res) => {
  const rows = await db
    .select()
    .from(barbersTable)
    .where(eq(barbersTable.active, true))
    .orderBy(asc(barbersTable.displayOrder), asc(barbersTable.id));
  res.json(rows.map((b) => serializeBarber(b, { publicView: true })));
});

router.get("/barbers/:slug", async (req, res) => {
  const { slug } = GetBarberParams.parse(req.params);
  const [barber] = await db
    .select()
    .from(barbersTable)
    .where(and(eq(barbersTable.slug, slug), eq(barbersTable.active, true)));
  if (!barber) {
    res.status(404).json({ error: "Barber not found" });
    return;
  }
  res.json(serializeBarber(barber, { publicView: true }));
});

router.get("/services", async (_req, res) => {
  const rows = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.active, true))
    .orderBy(asc(servicesTable.displayOrder), asc(servicesTable.id));
  res.json(rows.map(serializeService));
});

router.get("/testimonials", async (_req, res) => {
  const rows = await db
    .select()
    .from(testimonialsTable)
    .orderBy(asc(testimonialsTable.displayOrder), asc(testimonialsTable.id));
  res.json(rows.map(serializeTestimonial));
});

router.get("/landing-pages/:slug", async (req, res) => {
  const { slug } = GetLandingPageParams.parse(req.params);
  const [page] = await db
    .select()
    .from(landingPagesTable)
    .where(and(eq(landingPagesTable.slug, slug), eq(landingPagesTable.active, true)));
  if (!page) {
    res.status(404).json({ error: "Landing page not found" });
    return;
  }
  let barber = null;
  if (page.barberId !== null) {
    const [row] = await db
      .select()
      .from(barbersTable)
      .where(and(eq(barbersTable.id, page.barberId), eq(barbersTable.active, true)));
    barber = row ? serializeBarber(row, { publicView: true }) : null;
  }
  if (page.kind === "barber" && !barber) {
    res.status(404).json({ error: "Landing page not found" });
    return;
  }
  res.json({ ...serializeLandingPage(page), barber });
});

const clip = (v: string | null | undefined, max = 200) => (v ? v.slice(0, max) : null);

router.post("/events", async (req, res) => {
  const parsed = TrackEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid event" });
    return;
  }
  const e = parsed.data;
  let barberId = e.barberId ?? null;
  if (barberId !== null) {
    const [exists] = await db.select({ id: barbersTable.id }).from(barbersTable).where(eq(barbersTable.id, barberId));
    if (!exists) barberId = null;
  }
  await db.insert(eventsTable).values({
    type: e.type,
    sessionId: e.sessionId,
    path: e.path,
    barberId,
    landingPageSlug: clip(e.landingPageSlug, 100),
    variant: e.variant ?? null,
    utmSource: clip(e.utmSource),
    utmMedium: clip(e.utmMedium),
    utmCampaign: clip(e.utmCampaign),
    utmContent: clip(e.utmContent),
    utmTerm: clip(e.utmTerm),
    gclid: clip(e.gclid, 300),
    fbclid: clip(e.fbclid, 300),
  });
  res.status(202).json({ ok: true });
});

export default router;
