CREATE TYPE "public"."weekday" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');--> statement-breakpoint
CREATE TABLE "task_completion" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"user_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_weekly" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"due_weekday" "weekday" NOT NULL,
	"next_due_user_id" text,
	"next_due_date" date NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task_completion" ADD CONSTRAINT "task_completion_task_id_task_weekly_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_weekly"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_weekly" ADD CONSTRAINT "task_weekly_next_due_user_id_user_id_fk" FOREIGN KEY ("next_due_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;