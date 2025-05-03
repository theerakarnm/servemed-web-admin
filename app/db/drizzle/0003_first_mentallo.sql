CREATE TABLE "nutrition_facts" (
	"fact_id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"ingredient" varchar(255) NOT NULL,
	"amount_per_serving" varchar(100) NOT NULL,
	"percent_daily_value" varchar(10),
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "product_variants" RENAME COLUMN "iherb_stock_number" TO "stock_number";--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_iherb_stock_number_unique";--> statement-breakpoint
ALTER TABLE "nutrition_facts" ADD CONSTRAINT "nutrition_facts_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "nutrition_product_idx" ON "nutrition_facts" USING btree ("product_id");--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_stock_number_unique" UNIQUE("stock_number");