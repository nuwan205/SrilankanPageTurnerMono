CREATE TABLE IF NOT EXISTS "places" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"destination_id" varchar(255) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"duration" varchar(100) NOT NULL,
	"images" jsonb NOT NULL,
	"location" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "places" ADD CONSTRAINT "places_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
