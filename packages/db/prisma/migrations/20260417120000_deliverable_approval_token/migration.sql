-- AlterTable: add nullable approval_token and brand_approved_at to deliverables
ALTER TABLE "deliverables" ADD COLUMN "approval_token" VARCHAR(64);
ALTER TABLE "deliverables" ADD COLUMN "brand_approved_at" TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS "deliverables_approval_token_key" ON "deliverables"("approval_token");
