-- Add type column to places table
ALTER TABLE "places" ADD COLUMN "type" varchar(20) DEFAULT 'wellknown' NOT NULL;

-- Create index for better query performance
CREATE INDEX "idx_places_type" ON "places" ("type");
