CREATE TABLE "shopping_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"priority" integer NOT NULL,
	CONSTRAINT "shopping_category_name_unique" UNIQUE("name"),
	CONSTRAINT "shopping_category_priority_unique" UNIQUE("priority")
);
--> statement-breakpoint
CREATE TABLE "shopping_item" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text,
	"name" text NOT NULL,
	"amount" text DEFAULT '' NOT NULL,
	"priority" integer NOT NULL,
	"active" boolean NOT NULL,
	CONSTRAINT "shopping_item_name_unique" UNIQUE("name"),
	CONSTRAINT "shopping_item_categoryId_priority_unique" UNIQUE("category_id","priority")
);
--> statement-breakpoint
CREATE TABLE "shopping_purchase" (
	"id" text PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"user_id" text
);
--> statement-breakpoint
CREATE TABLE "shopping_purchase_item" (
	"purchase_id" text NOT NULL,
	"item_id" text NOT NULL,
	CONSTRAINT "shopping_purchase_item_purchase_id_item_id_pk" PRIMARY KEY("purchase_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "shopping_item" ADD CONSTRAINT "shopping_item_category_id_shopping_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."shopping_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_purchase" ADD CONSTRAINT "shopping_purchase_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_purchase_item" ADD CONSTRAINT "shopping_purchase_item_purchase_id_shopping_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."shopping_purchase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_purchase_item" ADD CONSTRAINT "shopping_purchase_item_item_id_shopping_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shopping_item"("id") ON DELETE no action ON UPDATE no action;