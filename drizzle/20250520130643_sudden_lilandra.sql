ALTER TABLE "task_completion" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "task_completion" ADD CONSTRAINT "task_completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completion" DROP COLUMN "user_ids";