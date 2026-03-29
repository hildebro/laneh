ALTER TABLE "single_task" RENAME TO "task_single";--> statement-breakpoint
ALTER TABLE "task_single" DROP CONSTRAINT "single_task_due_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "task_single" ADD CONSTRAINT "task_single_due_user_id_user_id_fk" FOREIGN KEY ("due_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;