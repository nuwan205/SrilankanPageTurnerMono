-- Add type column to categories table
ALTER TABLE "categories" ADD COLUMN "type" varchar(20) DEFAULT 'category' NOT NULL;

-- Create index for faster type filtering
CREATE INDEX "idx_categories_type" ON "categories" ("type");
