ALTER TABLE "balance_entry" DROP CONSTRAINT "balance_entry_purchase_id_shopping_purchase_id_fk";
--> statement-breakpoint
ALTER TABLE "shopping_purchase" ADD COLUMN "balance_entry_id" text;--> statement-breakpoint
ALTER TABLE "shopping_purchase" ADD CONSTRAINT "shopping_purchase_balance_entry_id_balance_entry_id_fk" FOREIGN KEY ("balance_entry_id") REFERENCES "public"."balance_entry"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_entry" DROP COLUMN "purchase_id";