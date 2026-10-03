CREATE TABLE "shopping_item_distinction" (
	"item_id" text NOT NULL,
	"other_item_id" text NOT NULL,
	"household_id" text DEFAULT current_setting('app.current_household_id') NOT NULL,
	CONSTRAINT "shopping_item_distinction_item_id_other_item_id_pk" PRIMARY KEY("item_id","other_item_id")
);
--> statement-breakpoint
ALTER TABLE "shopping_item_distinction" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "shopping_item_distinction" ADD CONSTRAINT "shopping_item_distinction_item_id_shopping_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shopping_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_item_distinction" ADD CONSTRAINT "shopping_item_distinction_other_item_id_shopping_item_id_fk" FOREIGN KEY ("other_item_id") REFERENCES "public"."shopping_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_item_distinction" ADD CONSTRAINT "shopping_item_distinction_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "isolate_households" ON "shopping_item_distinction" AS PERMISSIVE FOR ALL TO public USING (household_id = current_setting('app.current_household_id', true));