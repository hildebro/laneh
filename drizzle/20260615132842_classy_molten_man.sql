ALTER TABLE "balance_entry" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "shopping_category" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "shopping_item" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "shopping_purchase" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "task" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "balance_entry" ALTER COLUMN "household_id" SET DEFAULT current_setting('app.current_household_id');--> statement-breakpoint
ALTER TABLE "shopping_category" ALTER COLUMN "household_id" SET DEFAULT current_setting('app.current_household_id');--> statement-breakpoint
ALTER TABLE "shopping_item" ALTER COLUMN "household_id" SET DEFAULT current_setting('app.current_household_id');--> statement-breakpoint
ALTER TABLE "shopping_purchase" ALTER COLUMN "household_id" SET DEFAULT current_setting('app.current_household_id');--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "household_id" SET DEFAULT current_setting('app.current_household_id');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "household_id" SET DEFAULT current_setting('app.current_household_id');--> statement-breakpoint
CREATE POLICY "isolate_households" ON "balance_entry" AS PERMISSIVE FOR ALL TO public USING (household_id = current_setting('app.current_household_id', true));--> statement-breakpoint
CREATE POLICY "isolate_households" ON "shopping_category" AS PERMISSIVE FOR ALL TO public USING (household_id = current_setting('app.current_household_id', true));--> statement-breakpoint
CREATE POLICY "isolate_households" ON "shopping_item" AS PERMISSIVE FOR ALL TO public USING (household_id = current_setting('app.current_household_id', true));--> statement-breakpoint
CREATE POLICY "isolate_households" ON "shopping_purchase" AS PERMISSIVE FOR ALL TO public USING (household_id = current_setting('app.current_household_id', true));--> statement-breakpoint
CREATE POLICY "isolate_households" ON "task" AS PERMISSIVE FOR ALL TO public USING (household_id = current_setting('app.current_household_id', true));