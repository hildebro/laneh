CREATE TYPE "public"."notification_type" AS ENUM('task_done');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"household_id" text DEFAULT current_setting('app.current_household_id') NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"type" "notification_type" NOT NULL,
	"actor_user_id" text NOT NULL,
	"subject" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "isolate_households" ON "notification" AS PERMISSIVE FOR ALL TO public USING (household_id = current_setting('app.current_household_id', true));