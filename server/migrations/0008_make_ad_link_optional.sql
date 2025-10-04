-- Make link field optional in ads table
ALTER TABLE "ads" ALTER COLUMN "link" DROP NOT NULL;
