import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// "From the wall": framed photos from the shop wall, told as a timeline.
// Entries are private drafts until the owner records permission; the public
// API returns only rows with permissionOnFile = true.
export const wallEntriesTable = pgTable("wall_entries", {
  id: serial("id").primaryKey(),
  photoUrl: text("photo_url"),
  caption: text("caption").notNull(),
  // Only set when the owner knows it. Never guessed.
  year: integer("year"),
  people: jsonb("people").$type<string[]>().notNull().default([]),
  // e.g. "FOX 5 Good Day New York"; shown as "As seen on …" in text, never as a logo.
  pressOutlet: text("press_outlet"),
  permissionOnFile: boolean("permission_on_file").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WallEntryRow = typeof wallEntriesTable.$inferSelect;
