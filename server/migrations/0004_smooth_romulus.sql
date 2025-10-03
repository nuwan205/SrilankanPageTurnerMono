CREATE TABLE IF NOT EXISTS "ads" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"place_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"images" jsonb NOT NULL,
	"rating" real DEFAULT 4.5 NOT NULL,
	"phone" varchar(50),
	"whatsapp" varchar(50),
	"email" varchar(255),
	"link" text NOT NULL,
	"booking_link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ads" ADD CONSTRAINT "ads_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
