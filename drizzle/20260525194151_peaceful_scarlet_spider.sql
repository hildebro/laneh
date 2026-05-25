CREATE TYPE "public"."assignment" AS ENUM('everyone', 'someone', 'noone');--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_state_check";--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "assignment" "assignment";--> statement-breakpoint
UPDATE "task" SET "assignment" = 'everyone';--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_state_check" CHECK (
      ("task"."type" = 'single' AND "task"."due_weekday" IS NULL AND "task"."due_interval" IS NULL AND "task"."assignment" IS NULL)
      OR
      ("task"."type" = 'repeating' AND "task"."due_weekday" IS NOT NULL AND "task"."due_interval" IS NOT NULL AND "task"."due_date" IS NOT NULL AND "task"."assignment" IS NOT NULL)
    );