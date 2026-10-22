import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export type HoursEntry = {
  day: string;
  open: string | null;
  close: string | null;
  closed: boolean;
};

// Single-row table (id is always 1).
export const siteSettingsTable = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  shopName: text("shop_name").notNull(),
  foundedYear: integer("founded_year").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  postalCode: text("postal_code").notNull(),
  hours: jsonb("hours").$type<HoursEntry[]>().notNull(),
  offerPriceCents: integer("offer_price_cents").notNull(),
  comparisonPriceCents: integer("comparison_price_cents"),
  comparisonSourceNote: text("comparison_source_note"),
  announcementBanner: text("announcement_banner"),
  booksyBusinessUrl: text("booksy_business_url"),
  instagramUrl: text("instagram_url"),
  googleMapsUrl: text("google_maps_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SiteSettingsRow = typeof siteSettingsTable.$inferSelect;
