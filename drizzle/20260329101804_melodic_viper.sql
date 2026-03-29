CREATE TABLE "single_task" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"due_user_id" text,
	"due_date" date NOT NULL
);
--> statement-breakpoint
ALTER TABLE "single_task" ADD CONSTRAINT "single_task_due_user_id_user_id_fk" FOREIGN KEY ("due_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;