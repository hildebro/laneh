ALTER TABLE "shopping_category" DROP CONSTRAINT "shopping_category_name_unique";--> statement-breakpoint
ALTER TABLE "shopping_item" DROP CONSTRAINT "shopping_item_name_unique";--> statement-breakpoint
ALTER TABLE "shopping_category" ADD CONSTRAINT "shopping_category_name_householdId_unique" UNIQUE("name","household_id");--> statement-breakpoint
ALTER TABLE "shopping_item" ADD CONSTRAINT "shopping_item_name_householdId_unique" UNIQUE("name","household_id");--> statement-breakpoint
-- Used to find existing items with a similar name, see findSimilarShoppingItems().
CREATE EXTENSION IF NOT EXISTS "pg_trgm";--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "unaccent";
