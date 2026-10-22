import { boolean, date, index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { barbersTable } from "./barbers";

export const eventsTable = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    type: text("type", { enum: ["call_click", "book_click", "landing_view"] }).notNull(),
    sessionId: text("session_id").notNull(),
    path: text("path").notNull(),
    barberId: integer("barber_id").references(() => barbersTable.id, { onDelete: "set null" }),
    landingPageSlug: text("landing_page_slug"),
    variant: text("variant"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
    gclid: text("gclid"),
    fbclid: text("fbclid"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_created_at_idx").on(t.createdAt)],
);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  barberId: integer("barber_id").references(() => barbersTable.id, { onDelete: "set null" }),
  bookedAt: timestamp("booked_at", { withTimezone: true }).notNull(),
  valueCents: integer("value_cents").notNull().default(0),
  source: text("source", { enum: ["google_ads", "meta_ads", "organic", "walk_in", "other"] }).notNull(),
  utmCampaign: text("utm_campaign"),
  gclid: text("gclid"),
  fbclid: text("fbclid"),
  isRepeatClient: boolean("is_repeat_client").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform", { enum: ["google_ads", "meta_ads"] }).notNull(),
  barberId: integer("barber_id").references(() => barbersTable.id, { onDelete: "set null" }),
  landingPageSlug: text("landing_page_slug"),
  budgetCents: integer("budget_cents").notNull().default(0),
  spendCents: integer("spend_cents").notNull().default(0),
  startDate: date("start_date"),
  endDate: date("end_date"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["owner", "editor"] }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type EventRow = typeof eventsTable.$inferSelect;
export type BookingRow = typeof bookingsTable.$inferSelect;
export type CampaignRow = typeof campaignsTable.$inferSelect;
export type AdminUserRow = typeof adminUsersTable.$inferSelect;
