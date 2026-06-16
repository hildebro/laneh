ALTER TABLE "user" ADD COLUMN "admin" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE "user" SET admin = true;
