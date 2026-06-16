ALTER TABLE "user" DROP CONSTRAINT "user_username_unique";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_householdId_unique" UNIQUE("username","household_id");