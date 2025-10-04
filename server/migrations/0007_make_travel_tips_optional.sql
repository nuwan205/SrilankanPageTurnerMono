-- Make travel tips fields optional in places table
ALTER TABLE "places" ALTER COLUMN "best_time" DROP NOT NULL;
ALTER TABLE "places" ALTER COLUMN "travel_time" DROP NOT NULL;
ALTER TABLE "places" ALTER COLUMN "ideal_for" DROP NOT NULL;
