CREATE TABLE "staged_shopping_item" (
	"id" text PRIMARY KEY NOT NULL,
	"list_id" text NOT NULL,
	"status" text NOT NULL,
	"name" text NOT NULL,
	"amount" text NOT NULL,
	"matched_item_id" text,
	"suggested_item_id" text
);
--> statement-breakpoint
CREATE TABLE "staged_shopping_list" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "staged_shopping_item" ADD CONSTRAINT "staged_shopping_item_list_id_staged_shopping_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."staged_shopping_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_shopping_item" ADD CONSTRAINT "staged_shopping_item_matched_item_id_shopping_item_id_fk" FOREIGN KEY ("matched_item_id") REFERENCES "public"."shopping_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_shopping_item" ADD CONSTRAINT "staged_shopping_item_suggested_item_id_shopping_item_id_fk" FOREIGN KEY ("suggested_item_id") REFERENCES "public"."shopping_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_shopping_list" ADD CONSTRAINT "staged_shopping_list_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;