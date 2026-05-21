ALTER TABLE "task_single" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "task_weekly" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "task_weekly_completion" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "task_single" CASCADE;--> statement-breakpoint
DROP TABLE "task_weekly" CASCADE;--> statement-breakpoint
DROP TABLE "task_weekly_completion" CASCADE;--> statement-breakpoint