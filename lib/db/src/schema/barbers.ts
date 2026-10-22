import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type NotableClient = { name: string; consent: boolean; note?: string | null };

export const barbersTable = pgTable("barbers", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  title: text("title").notNull().default("Barber"),
  photoUrl: text("photo_url"),
  bio: text("bio").notNull().default(""),
  yearsCutting: integer("years_cutting"),
  specialties: jsonb("specialties").$type<string[]>().notNull().default([]),
  galleryImages: jsonb("gallery_images").$type<string[]>().notNull().default([]),
  instagramUrl: text("instagram_url"),
  tiktokUrl: text("tiktok_url"),
  otherSocialUrl: text("other_social_url"),
  booksyUrl: text("booksy_url"),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  notableClients: jsonb("notable_clients").$type<NotableClient[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BarberRow = typeof barbersTable.$inferSelect;
