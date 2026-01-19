CREATE TABLE "balance_entry_distribution" (
	"entry_id" text NOT NULL,
	"user_id" text NOT NULL,
	"percent" double precision NOT NULL,
	CONSTRAINT "balance_entry_distribution_entry_id_user_id_pk" PRIMARY KEY("entry_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "balance_entry_distribution" ADD CONSTRAINT "balance_entry_distribution_entry_id_balance_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."balance_entry"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_entry_distribution" ADD CONSTRAINT "balance_entry_distribution_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;