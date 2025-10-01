import { pgTable, text, boolean, timestamp, varchar } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 100 }).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
