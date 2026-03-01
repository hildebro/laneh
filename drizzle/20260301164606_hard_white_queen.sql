ALTER TABLE "user" ADD COLUMN "password" text NOT NULL DEFAULT 'temp';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "password" DROP DEFAULT;--> statement-breakpoint