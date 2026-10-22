import { Router, type IRouter, type Response } from "express";
import { and, asc, count, desc, eq, gte, isNotNull, isNull, or, sql, sum } from "drizzle-orm";
import {
  adminUsersTable,
  barbersTable,
  bookingsTable,
  campaignsTable,
  db,
  eventsTable,
  landingPagesTable,
  servicesTable,
  siteSettingsTable,
} from "@workspace/db";
import {
  AdminCreateBarberBody,
  AdminCreateBookingBody,
  AdminCreateCampaignBody,
  AdminCreateLandingPageBody,
  AdminCreateServiceBody,
  AdminCreateUserBody,
  AdminDeleteBarberParams,
  AdminGetPerformanceQueryParams,
  AdminListRecentEventsQueryParams,
  AdminUpdateBarberBody,
  AdminUpdateBarberParams,
  AdminUpdateCampaignBody,
  AdminUpdateLandingPageBody,
  AdminUpdateServiceBody,
  UpdateSiteSettingsBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  serializeAdmin,
  serializeBarber,
  serializeBooking,
  serializeCampaign,
  serializeEvent,
  serializeLandingPage,
  serializeService,
  serializeSettings,
  slugify,
  toDateString,
} from "../lib/serialize";

export const TARGET_COST_PER_BOOKING_CENTS = 6000;

const router: IRouter = Router();
router.use("/admin", requireAdmin("editor"));

const idOf = (params: unknown) => AdminDeleteBarberParams.parse(params).id;

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

function conflict(res: Response, what: string) {
  res.status(409).json({ error: `That ${what} is already in use` });
}

async function barberNames(): Promise<Map<number, string>> {
  const rows = await db.select({ id: barbersTable.id, name: barbersTable.name }).from(barbersTable);
  return new Map(rows.map((r) => [r.id, r.name]));
}

// ---------- Me / settings ----------
router.get("/admin/me", (req, res) => {
  res.json(serializeAdmin(req.admin!));
});

router.put("/admin/site", async (req, res) => {
  const body = UpdateSiteSettingsBody.parse(req.body);
  const [row] = await db
    .update(siteSettingsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(siteSettingsTable.id, 1))
    .returning();
  res.json(serializeSettings(row));
});

// ---------- Barbers ----------
router.get("/admin/barbers", async (_req, res) => {
  const rows = await db.select().from(barbersTable).orderBy(asc(barbersTable.displayOrder), asc(barbersTable.id));
  res.json(rows.map((b) => serializeBarber(b, { publicView: false })));
});

router.post("/admin/barbers", async (req, res) => {
  const body = AdminCreateBarberBody.parse(req.body);
  const slug = slugify(body.slug?.trim() || body.name);
  if (!slug) {
    res.status(400).json({ error: "A name or slug with letters or numbers is required" });
    return;
  }
  try {
    const [row] = await db
      .insert(barbersTable)
      .values({ ...body, slug, notableClients: body.notableClients ?? [] })
      .returning();
    res.status(201).json(serializeBarber(row, { publicView: false }));
  } catch (err) {
    if (isUniqueViolation(err)) return conflict(res, "barber URL slug");
    throw err;
  }
});

router.patch("/admin/barbers/:id", async (req, res) => {
  const { id } = AdminUpdateBarberParams.parse(req.params);
  const body = AdminUpdateBarberBody.parse(req.body);
  const patch = { ...body, ...(body.slug !== undefined ? { slug: slugify(body.slug) } : {}) };
  try {
    const [row] = await db
      .update(barbersTable)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(barbersTable.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Barber not found" });
      return;
    }
    res.json(serializeBarber(row, { publicView: false }));
  } catch (err) {
    if (isUniqueViolation(err)) return conflict(res, "barber URL slug");
    throw err;
  }
});

router.delete("/admin/barbers/:id", async (req, res) => {
  const id = idOf(req.params);
  await db.delete(barbersTable).where(eq(barbersTable.id, id));
  res.status(204).end();
});

// ---------- Services ----------
router.get("/admin/services", async (_req, res) => {
  const rows = await db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder), asc(servicesTable.id));
  res.json(rows.map(serializeService));
});

router.post("/admin/services", async (req, res) => {
  const body = AdminCreateServiceBody.parse(req.body);
  const [row] = await db.insert(servicesTable).values(body).returning();
  res.status(201).json(serializeService(row));
});

router.patch("/admin/services/:id", async (req, res) => {
  const id = idOf(req.params);
  const body = AdminUpdateServiceBody.parse(req.body);
  const [row] = await db
    .update(servicesTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(servicesTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json(serializeService(row));
});

router.delete("/admin/services/:id", async (req, res) => {
  await db.delete(servicesTable).where(eq(servicesTable.id, idOf(req.params)));
  res.status(204).end();
});

// ---------- Landing pages ----------
router.get("/admin/landing-pages", async (_req, res) => {
  const rows = await db.select().from(landingPagesTable).orderBy(asc(landingPagesTable.id));
  res.json(rows.map(serializeLandingPage));
});

function validateLandingKind(kind: string | undefined, barberId: number | null | undefined): string | null {
  if (kind === "barber" && (barberId === null || barberId === undefined)) {
    return "A barber landing page needs a barber";
  }
  return null;
}

router.post("/admin/landing-pages", async (req, res) => {
  const body = AdminCreateLandingPageBody.parse(req.body);
  const problem = validateLandingKind(body.kind, body.barberId);
  if (problem) {
    res.status(400).json({ error: problem });
    return;
  }
  const slug = slugify(body.slug);
  try {
    const [row] = await db.insert(landingPagesTable).values({ ...body, slug }).returning();
    res.status(201).json(serializeLandingPage(row));
  } catch (err) {
    if (isUniqueViolation(err)) return conflict(res, "landing page URL slug");
    throw err;
  }
});

router.patch("/admin/landing-pages/:id", async (req, res) => {
  const id = idOf(req.params);
  const body = AdminUpdateLandingPageBody.parse(req.body);
  const [existing] = await db.select().from(landingPagesTable).where(eq(landingPagesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Landing page not found" });
    return;
  }
  const problem = validateLandingKind(
    body.kind ?? existing.kind,
    body.barberId !== undefined ? body.barberId : existing.barberId,
  );
  if (problem) {
    res.status(400).json({ error: problem });
    return;
  }
  try {
    const [row] = await db
      .update(landingPagesTable)
      .set({ ...body, ...(body.slug !== undefined ? { slug: slugify(body.slug) } : {}), updatedAt: new Date() })
      .where(eq(landingPagesTable.id, id))
      .returning();
    res.json(serializeLandingPage(row));
  } catch (err) {
    if (isUniqueViolation(err)) return conflict(res, "landing page URL slug");
    throw err;
  }
});

router.delete("/admin/landing-pages/:id", async (req, res) => {
  await db.delete(landingPagesTable).where(eq(landingPagesTable.id, idOf(req.params)));
  res.status(204).end();
});

// ---------- Bookings ----------
router.get("/admin/bookings", async (_req, res) => {
  const [rows, names] = await Promise.all([
    db.select().from(bookingsTable).orderBy(desc(bookingsTable.bookedAt)),
    barberNames(),
  ]);
  res.json(rows.map((b) => serializeBooking(b, b.barberId ? names.get(b.barberId) ?? null : null)));
});

router.post("/admin/bookings", async (req, res) => {
  const body = AdminCreateBookingBody.parse(req.body);
  const [row] = await db.insert(bookingsTable).values(body).returning();
  const names = await barberNames();
  res.status(201).json(serializeBooking(row, row.barberId ? names.get(row.barberId) ?? null : null));
});

router.delete("/admin/bookings/:id", async (req, res) => {
  await db.delete(bookingsTable).where(eq(bookingsTable.id, idOf(req.params)));
  res.status(204).end();
});

// ---------- Campaigns ----------
router.get("/admin/campaigns", async (_req, res) => {
  const [rows, names] = await Promise.all([
    db.select().from(campaignsTable).orderBy(desc(campaignsTable.createdAt)),
    barberNames(),
  ]);
  res.json(rows.map((c) => serializeCampaign(c, c.barberId ? names.get(c.barberId) ?? null : null)));
});

router.post("/admin/campaigns", async (req, res) => {
  const body = AdminCreateCampaignBody.parse(req.body);
  const [row] = await db
    .insert(campaignsTable)
    .values({ ...body, startDate: toDateString(body.startDate), endDate: toDateString(body.endDate) })
    .returning();
  const names = await barberNames();
  res.status(201).json(serializeCampaign(row, row.barberId ? names.get(row.barberId) ?? null : null));
});

router.patch("/admin/campaigns/:id", async (req, res) => {
  const id = idOf(req.params);
  const body = AdminUpdateCampaignBody.parse(req.body);
  const [row] = await db
    .update(campaignsTable)
    .set({ ...body, startDate: toDateString(body.startDate), endDate: toDateString(body.endDate) })
    .where(eq(campaignsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  const names = await barberNames();
  res.json(serializeCampaign(row, row.barberId ? names.get(row.barberId) ?? null : null));
});

router.delete("/admin/campaigns/:id", async (req, res) => {
  await db.delete(campaignsTable).where(eq(campaignsTable.id, idOf(req.params)));
  res.status(204).end();
});

// ---------- Reporting ----------
type Bucket = {
  bookClicks: number;
  callClicks: number;
  landingViews: number;
  bookings: number;
  repeatBookings: number;
  spendCents: number;
};
const emptyBucket = (): Bucket => ({
  bookClicks: 0,
  callClicks: 0,
  landingViews: 0,
  bookings: 0,
  repeatBookings: 0,
  spendCents: 0,
});

function costAndStatus(b: Bucket) {
  const costPerBookingCents = b.bookings > 0 ? Math.round(b.spendCents / b.bookings) : null;
  const status =
    b.spendCents === 0
      ? "no_spend"
      : costPerBookingCents === null
        ? "no_bookings"
        : costPerBookingCents <= TARGET_COST_PER_BOOKING_CENTS
          ? "on_target"
          : "over_target";
  return { costPerBookingCents, status } as const;
}

router.get("/admin/reports/performance", async (req, res) => {
  const { days } = AdminGetPerformanceQueryParams.parse(req.query);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sinceDate = since.toISOString().slice(0, 10);

  const [eventCounts, bookingCounts, spendRows, variantRows, barbers] = await Promise.all([
    db
      .select({ barberId: eventsTable.barberId, type: eventsTable.type, n: count() })
      .from(eventsTable)
      .where(gte(eventsTable.createdAt, since))
      .groupBy(eventsTable.barberId, eventsTable.type),
    db
      .select({
        barberId: bookingsTable.barberId,
        n: count(),
        repeats: sql<number>`count(*) filter (where ${bookingsTable.isRepeatClient})`.mapWith(Number),
      })
      .from(bookingsTable)
      .where(gte(bookingsTable.bookedAt, since))
      .groupBy(bookingsTable.barberId),
    // Spend is entered as spend-to-date per campaign; include campaigns that ran during the window.
    db
      .select({ barberId: campaignsTable.barberId, spend: sum(campaignsTable.spendCents).mapWith(Number) })
      .from(campaignsTable)
      .where(or(isNull(campaignsTable.endDate), gte(campaignsTable.endDate, sinceDate)))
      .groupBy(campaignsTable.barberId),
    db
      .select({
        slug: eventsTable.landingPageSlug,
        variant: sql<string>`coalesce(${eventsTable.variant}, 'A')`,
        type: eventsTable.type,
        n: count(),
      })
      .from(eventsTable)
      .where(and(gte(eventsTable.createdAt, since), isNotNull(eventsTable.landingPageSlug)))
      .groupBy(eventsTable.landingPageSlug, sql`coalesce(${eventsTable.variant}, 'A')`, eventsTable.type),
    db.select().from(barbersTable).orderBy(asc(barbersTable.displayOrder), asc(barbersTable.id)),
  ]);

  const buckets = new Map<number | null, Bucket>();
  const bucket = (id: number | null) => {
    let b = buckets.get(id);
    if (!b) {
      b = emptyBucket();
      buckets.set(id, b);
    }
    return b;
  };
  for (const b of barbers) if (b.active) bucket(b.id);
  for (const e of eventCounts) {
    const b = bucket(e.barberId);
    if (e.type === "book_click") b.bookClicks += e.n;
    else if (e.type === "call_click") b.callClicks += e.n;
    else b.landingViews += e.n;
  }
  for (const r of bookingCounts) {
    const b = bucket(r.barberId);
    b.bookings += r.n;
    b.repeatBookings += r.repeats;
  }
  for (const r of spendRows) bucket(r.barberId).spendCents += r.spend ?? 0;

  const nameById = new Map(barbers.map((b) => [b.id, b.name]));
  const order = new Map(barbers.map((b, i) => [b.id, i]));
  const rows = [...buckets.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : (order.get(a) ?? 0) - (order.get(b) ?? 0)))
    .map(([barberId, b]) => ({
      barberId,
      barberName: barberId === null ? "Shop-wide / unattributed" : nameById.get(barberId) ?? "Removed barber",
      ...b,
      ...costAndStatus(b),
    }));

  const totals = rows.reduce((acc, r) => {
    acc.bookClicks += r.bookClicks;
    acc.callClicks += r.callClicks;
    acc.landingViews += r.landingViews;
    acc.bookings += r.bookings;
    acc.repeatBookings += r.repeatBookings;
    acc.spendCents += r.spendCents;
    return acc;
  }, emptyBucket());

  const variantMap = new Map<string, { landingPageSlug: string; variant: string; views: number; bookClicks: number; callClicks: number }>();
  for (const v of variantRows) {
    if (!v.slug) continue;
    const key = `${v.slug}::${v.variant}`;
    const entry = variantMap.get(key) ?? { landingPageSlug: v.slug, variant: v.variant, views: 0, bookClicks: 0, callClicks: 0 };
    if (v.type === "landing_view") entry.views += v.n;
    else if (v.type === "book_click") entry.bookClicks += v.n;
    else entry.callClicks += v.n;
    variantMap.set(key, entry);
  }
  const variants = [...variantMap.values()]
    .sort((a, b) => a.landingPageSlug.localeCompare(b.landingPageSlug) || a.variant.localeCompare(b.variant))
    .map((v) => ({ ...v, clickRate: v.views > 0 ? (v.bookClicks + v.callClicks) / v.views : 0 }));

  res.json({
    days,
    targetCostPerBookingCents: TARGET_COST_PER_BOOKING_CENTS,
    totals: {
      bookClicks: totals.bookClicks,
      callClicks: totals.callClicks,
      landingViews: totals.landingViews,
      bookings: totals.bookings,
      spendCents: totals.spendCents,
      costPerBookingCents: totals.bookings > 0 ? Math.round(totals.spendCents / totals.bookings) : null,
    },
    barbers: rows,
    variants,
  });
});

router.get("/admin/events/recent", async (req, res) => {
  const { limit } = AdminListRecentEventsQueryParams.parse(req.query);
  const [rows, names] = await Promise.all([
    db.select().from(eventsTable).orderBy(desc(eventsTable.createdAt)).limit(limit),
    barberNames(),
  ]);
  res.json(rows.map((e) => serializeEvent(e, e.barberId ? names.get(e.barberId) ?? null : null)));
});

// ---------- Admin users (owner only) ----------
router.get("/admin/users", requireAdmin("owner"), async (_req, res) => {
  const rows = await db.select().from(adminUsersTable).orderBy(asc(adminUsersTable.createdAt));
  res.json(rows.map(serializeAdmin));
});

router.post("/admin/users", requireAdmin("owner"), async (req, res) => {
  const body = AdminCreateUserBody.parse(req.body);
  try {
    const [row] = await db
      .insert(adminUsersTable)
      .values({ email: body.email.trim().toLowerCase(), role: body.role })
      .returning();
    res.status(201).json(serializeAdmin(row));
  } catch (err) {
    if (isUniqueViolation(err)) return conflict(res, "email");
    throw err;
  }
});

router.delete("/admin/users/:id", requireAdmin("owner"), async (req, res) => {
  const id = idOf(req.params);
  if (id === req.admin!.id) {
    res.status(400).json({ error: "You cannot remove your own access" });
    return;
  }
  const [target] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, id));
  if (!target) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }
  if (target.role === "owner") {
    const [{ n }] = await db.select({ n: count() }).from(adminUsersTable).where(eq(adminUsersTable.role, "owner"));
    if (n <= 1) {
      res.status(400).json({ error: "The last owner cannot be removed" });
      return;
    }
  }
  await db.delete(adminUsersTable).where(eq(adminUsersTable.id, id));
  res.status(204).end();
});

export default router;
