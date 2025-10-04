import { pgTable, text, varchar, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { places } from "./places";

export const ads = pgTable("ads", {
  id: varchar("id", { length: 255 }).primaryKey(),
  placeId: varchar("place_id", { length: 255 })
    .notNull()
    .references(() => places.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  poster: text("poster").notNull(), // NEW FIELD: Single poster/company image
  rating: real("rating").notNull().default(4.5),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  email: varchar("email", { length: 255 }),
  link: text("link").notNull(),
  bookingLink: text("booking_link"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Ad = typeof ads.$inferSelect;
export type NewAd = typeof ads.$inferInsert;
