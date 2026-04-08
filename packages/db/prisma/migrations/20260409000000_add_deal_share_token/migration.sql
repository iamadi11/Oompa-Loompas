-- AlterTable: add nullable unique share_token column to deals
ALTER TABLE "deals" ADD COLUMN "share_token" VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS "deals_share_token_key" ON "deals"("share_token");
