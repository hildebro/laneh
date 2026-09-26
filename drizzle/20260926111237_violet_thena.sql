ALTER TYPE "public"."systemStoreKey" ADD VALUE 'item_stats_calculated_at';--> statement-breakpoint
CREATE TABLE "shopping_item_stats" (
	"item_id" text PRIMARY KEY NOT NULL,
	"household_id" text DEFAULT current_setting('app.current_household_id') NOT NULL,
	"purchase_count" integer NOT NULL,
	"average_days_between_purchases" double precision,
	"last_purchase_date" timestamp NOT NULL,
	"next_purchase_date" timestamp
);
--> statement-breakpoint
ALTER TABLE "shopping_item_stats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "shopping_item_stats" ADD CONSTRAINT "shopping_item_stats_item_id_shopping_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shopping_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_item_stats" ADD CONSTRAINT "shopping_item_stats_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "isolate_households" ON "shopping_item_stats" AS PERMISSIVE FOR ALL TO public USING (household_id = current_setting('app.current_household_id', true));