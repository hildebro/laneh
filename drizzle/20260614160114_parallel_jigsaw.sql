CREATE TABLE "household" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "balance_entry_distribution" DROP CONSTRAINT "balance_entry_distribution_entry_id_balance_entry_id_fk";
--> statement-breakpoint
ALTER TABLE "balance_entry_distribution" DROP CONSTRAINT "balance_entry_distribution_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "shopping_purchase_item" DROP CONSTRAINT "shopping_purchase_item_purchase_id_shopping_purchase_id_fk";
--> statement-breakpoint
ALTER TABLE "shopping_purchase_item" DROP CONSTRAINT "shopping_purchase_item_item_id_shopping_item_id_fk";
--> statement-breakpoint
ALTER TABLE "staged_shopping_purchase_item" DROP CONSTRAINT "staged_shopping_purchase_item_item_id_shopping_item_id_fk";
--> statement-breakpoint
ALTER TABLE "staged_shopping_purchase_item" DROP CONSTRAINT "staged_shopping_purchase_item_user_id_user_id_fk";
--> statement-breakpoint

-- 1. Add columns as NULLABLE first
ALTER TABLE "balance_entry" ADD COLUMN "household_id" text;
--> statement-breakpoint
ALTER TABLE "shopping_category" ADD COLUMN "household_id" text;
--> statement-breakpoint
ALTER TABLE "shopping_item" ADD COLUMN "household_id" text;
--> statement-breakpoint
ALTER TABLE "shopping_purchase" ADD COLUMN "household_id" text;
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "household_id" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "household_id" text;
--> statement-breakpoint

-- 2. Conditionally backfill data ONLY if records exist
DO $$
DECLARE
  new_household_id text := '';
  base32_chars text := 'abcdefghijklmnopqrstuvwxyz234567';
  i integer;
BEGIN
  -- Check if there is existing data by looking at the user table
  IF EXISTS (SELECT 1 FROM "user") THEN

    -- Generate a 24-character base32 ID to match the TypeScript encodeBase32LowerCase format
    FOR i IN 1..24 LOOP
      new_household_id := new_household_id || substr(base32_chars, floor(random() * 32 + 1)::int, 1);
    END LOOP;

    -- Insert the default household
    INSERT INTO "household" ("id", "name", "created_at")
    VALUES (new_household_id, 'My Household', now());

    -- Backfill all the existing rows with the new household ID
    UPDATE "user" SET "household_id" = new_household_id;
    UPDATE "shopping_category" SET "household_id" = new_household_id;
    UPDATE "shopping_item" SET "household_id" = new_household_id;
    UPDATE "shopping_purchase" SET "household_id" = new_household_id;
    UPDATE "balance_entry" SET "household_id" = new_household_id;
    UPDATE "task" SET "household_id" = new_household_id;

  END IF;
END $$;
--> statement-breakpoint

-- 3. Enforce NOT NULL now that data is clean (or empty)
ALTER TABLE "balance_entry" ALTER COLUMN "household_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "shopping_category" ALTER COLUMN "household_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "shopping_item" ALTER COLUMN "household_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "shopping_purchase" ALTER COLUMN "household_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "household_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "household_id" SET NOT NULL;
--> statement-breakpoint

-- 4. Add Constraints and Foreign Keys
ALTER TABLE "balance_entry" ADD CONSTRAINT "balance_entry_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "balance_entry_distribution" ADD CONSTRAINT "balance_entry_distribution_entry_id_balance_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."balance_entry"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "balance_entry_distribution" ADD CONSTRAINT "balance_entry_distribution_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shopping_category" ADD CONSTRAINT "shopping_category_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shopping_item" ADD CONSTRAINT "shopping_item_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shopping_purchase" ADD CONSTRAINT "shopping_purchase_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shopping_purchase_item" ADD CONSTRAINT "shopping_purchase_item_purchase_id_shopping_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."shopping_purchase"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shopping_purchase_item" ADD CONSTRAINT "shopping_purchase_item_item_id_shopping_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shopping_item"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "staged_shopping_purchase_item" ADD CONSTRAINT "staged_shopping_purchase_item_item_id_shopping_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shopping_item"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "staged_shopping_purchase_item" ADD CONSTRAINT "staged_shopping_purchase_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;