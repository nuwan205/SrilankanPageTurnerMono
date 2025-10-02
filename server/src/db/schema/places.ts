import { pgTable, text, varchar, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { destinations } from "./destinations";

export const places = pgTable("places", {
  id: varchar("id", { length: 255 }).primaryKey(),
  destinationId: varchar("destination_id", { length: 255 })
    .notNull()
    .references(() => destinations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  rating: real("rating").notNull().default(0),
  duration: varchar("duration", { length: 100 }).notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  location: jsonb("location").$type<{ lat: number; lng: number }>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
