import { pgTable, text, boolean, timestamp, varchar, real, jsonb } from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const destinations = pgTable("destinations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  categoryId: varchar("category_id", { length: 255 })
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  rating: real("rating").notNull().default(0),
  duration: varchar("duration", { length: 100 }).notNull(),
  highlights: jsonb("highlights").$type<string[]>().notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;
