CREATE TYPE "public"."balance_entry_type" AS ENUM('groceries', 'eating_out', 'events', 'gifts', 'household_goods', 'transportation', 'miscellaneous');--> statement-breakpoint
ALTER TABLE "balance_entry" ADD COLUMN "type" "balance_entry_type" DEFAULT 'miscellaneous' NOT NULL;--> statement-breakpoint
ALTER TABLE "balance_entry" ALTER COLUMN "type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "balance_entry" RENAME COLUMN "name" TO "description";
