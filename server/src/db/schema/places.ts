import { pgTable, text, varchar, real, jsonb, timestamp } from "drizzle-orm/pg-core";

export const places = pgTable("places", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  rating: real("rating").notNull().default(0),
  duration: varchar("duration", { length: 100 }).notNull(),
  highlights: jsonb("highlights").$type<string[]>().notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  location: jsonb("location").$type<{ lat: number; lng: number }>().notNull(),
  // Travel Tips
  bestTime: varchar("best_time", { length: 200 }).notNull(),
  travelTime: varchar("travel_time", { length: 200 }).notNull(),
  idealFor: varchar("ideal_for", { length: 300 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
