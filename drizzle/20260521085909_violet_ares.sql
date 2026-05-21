CREATE TYPE "public"."task_type" AS ENUM('single', 'repeating');--> statement-breakpoint
CREATE TABLE "task" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"type" "task_type" NOT NULL,
	"name" text NOT NULL,
	"due_user_id" text,
	"due_date" date,
	"done" boolean DEFAULT false,
	"due_weekday" "weekday",
	"due_interval" integer,
	CONSTRAINT "task_state_check" CHECK (
      ("task"."type" = 'single' AND "task"."due_weekday" IS NULL AND "task"."due_interval" IS NULL)
      OR
      ("task"."type" = 'repeating' AND "task"."due_weekday" IS NOT NULL AND "task"."due_interval" IS NOT NULL AND "task"."due_date" IS NOT NULL)
    )
);
--> statement-breakpoint
CREATE TABLE "task_completion" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_due_user_id_user_id_fk" FOREIGN KEY ("due_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completion" ADD CONSTRAINT "task_completion_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completion" ADD CONSTRAINT "task_completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO task (id, type, name, due_user_id, due_date)
SELECT id, 'single', name, due_user_id, due_date
FROM task_single;
--> statement-breakpoint
INSERT INTO task (id, type, name, due_user_id, due_date, due_weekday, due_interval)
SELECT id, 'repeating', name, due_user_id, due_date, due_weekday, task_weekly.interval
FROM task_weekly;
--> statement-breakpoint
INSERT INTO task_completion (id, task_id, user_id, date)
SELECT id, task_id, user_id, date
FROM task_weekly_completion;