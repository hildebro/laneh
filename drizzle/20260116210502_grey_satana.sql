CREATE TABLE "balance_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"price" integer NOT NULL,
	"name" text,
	"purchase_id" text
);
--> statement-breakpoint
ALTER TABLE "balance_entry" ADD CONSTRAINT "balance_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_entry" ADD CONSTRAINT "balance_entry_purchase_id_shopping_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."shopping_purchase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_purchase" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "shopping_purchase" DROP COLUMN "name";