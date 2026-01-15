CREATE TABLE "staged_shopping_purchase_item" (
	"item_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "staged_shopping_purchase_item_item_id_user_id_pk" PRIMARY KEY("item_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "staged_shopping_purchase_item" ADD CONSTRAINT "staged_shopping_purchase_item_item_id_shopping_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shopping_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_shopping_purchase_item" ADD CONSTRAINT "staged_shopping_purchase_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;