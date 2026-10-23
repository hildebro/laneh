ALTER TABLE "shopping_item_stats" ADD COLUMN "median_days_between_purchases" double precision;--> statement-breakpoint
ALTER TABLE "shopping_item_stats" DROP COLUMN "average_days_between_purchases";--> statement-breakpoint
ALTER TABLE "shopping_item_stats" DROP COLUMN "next_purchase_date";--> statement-breakpoint
-- Forces a full recalculation of the stats by the next nightly job run.
DELETE FROM "system_store" WHERE "key" = 'item_stats_calculated_at';