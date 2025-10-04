import { pgTable, varchar, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { places } from "./places";
import { categories } from "./categories";

// Junction table for many-to-many relationship between places and categories
export const placesToCategories = pgTable(
  "places_to_categories",
  {
    placeId: varchar("place_id", { length: 255 })
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    categoryId: varchar("category_id", { length: 255 })
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.placeId, table.categoryId] }),
  })
);

export type PlaceToCategory = typeof placesToCategories.$inferSelect;
export type NewPlaceToCategory = typeof placesToCategories.$inferInsert;
