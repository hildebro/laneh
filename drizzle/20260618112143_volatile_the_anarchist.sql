ALTER TABLE "user" RENAME COLUMN "admin" TO "server_admin";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "household_admin" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE "user" SET "household_admin" = "server_admin";
