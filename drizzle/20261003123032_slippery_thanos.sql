ALTER TABLE "household" ADD COLUMN "setup_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- Households from before the setup wizard already have their categories.
UPDATE "household" SET "setup_completed" = true;