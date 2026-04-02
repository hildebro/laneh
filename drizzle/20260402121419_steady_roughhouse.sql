ALTER TABLE "task_completion" RENAME TO "task_weekly_completion";--> statement-breakpoint
ALTER TABLE "task_weekly" RENAME COLUMN "next_due_user_id" TO "due_user_id";--> statement-breakpoint
ALTER TABLE "task_weekly" RENAME COLUMN "next_due_date" TO "due_date";--> statement-breakpoint
ALTER TABLE "task_weekly_completion" DROP CONSTRAINT "task_completion_task_id_task_weekly_id_fk";
--> statement-breakpoint
ALTER TABLE "task_weekly_completion" DROP CONSTRAINT "task_completion_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "task_weekly" DROP CONSTRAINT "task_weekly_next_due_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "task_weekly_completion" ADD CONSTRAINT "task_weekly_completion_task_id_task_weekly_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_weekly"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_weekly_completion" ADD CONSTRAINT "task_weekly_completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_weekly" ADD CONSTRAINT "task_weekly_due_user_id_user_id_fk" FOREIGN KEY ("due_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;