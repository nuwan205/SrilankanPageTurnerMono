-- Migration: Add poster field to ads table
-- Date: 2025-10-04
-- Description: Add a poster (company/location image) field to ads table

-- Add poster column (text type for URL storage)
ALTER TABLE ads 
ADD COLUMN IF NOT EXISTS poster TEXT;

-- For existing ads, set poster to first image as default
UPDATE ads 
SET poster = (images->0)::text
WHERE poster IS NULL AND jsonb_array_length(images) > 0;

-- Make poster NOT NULL after setting defaults
ALTER TABLE ads 
ALTER COLUMN poster SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN ads.poster IS 'URL of the main poster/company image for the ad (single image)';
