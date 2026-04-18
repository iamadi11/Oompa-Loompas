-- AlterTable
ALTER TABLE "payments" ADD COLUMN "remind_at" TIMESTAMPTZ;

-- CreateIndex
CREATE INDEX "payments_remind_at_idx" ON "payments"("remind_at");
