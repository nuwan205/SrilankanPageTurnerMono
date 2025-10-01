CREATE TABLE IF NOT EXISTS "categories" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"icon" varchar(50) NOT NULL,
	"color" varchar(100) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
