import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { barbersTable } from "./barbers";

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  durationMinutes: integer("duration_minutes"),
  category: text("category").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testimonialsTable = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  author: text("author").notNull(),
  quote: text("quote").notNull(),
  barberName: text("barber_name"),
  source: text("source"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const landingPagesTable = pgTable("landing_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  kind: text("kind", { enum: ["barber", "offer"] }).notNull(),
  barberId: integer("barber_id").references(() => barbersTable.id, { onDelete: "set null" }),
  headline: text("headline").notNull(),
  subheadline: text("subheadline").notNull().default(""),
  variantBHeadline: text("variant_b_headline"),
  variantBSubheadline: text("variant_b_subheadline"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ServiceRow = typeof servicesTable.$inferSelect;
export type TestimonialRow = typeof testimonialsTable.$inferSelect;
export type LandingPageRow = typeof landingPagesTable.$inferSelect;
