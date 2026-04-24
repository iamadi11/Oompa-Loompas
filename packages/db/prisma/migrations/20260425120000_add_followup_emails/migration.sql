-- Add followup_emails_enabled flag to users (default true = opt-out model)
ALTER TABLE "users" ADD COLUMN "followup_emails_enabled" BOOLEAN NOT NULL DEFAULT TRUE;

-- New table: tracks which overdue threshold emails have been sent per payment
CREATE TABLE "payment_followup_emails" (
    "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_id"    UUID NOT NULL,
    "day_threshold" INTEGER NOT NULL,
    "sent_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "payment_followup_emails_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "payment_followup_emails"
    ADD CONSTRAINT "payment_followup_emails_payment_id_fkey"
    FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "payment_followup_emails_payment_id_day_threshold_key"
    ON "payment_followup_emails"("payment_id", "day_threshold");

CREATE INDEX "payment_followup_emails_payment_id_idx"
    ON "payment_followup_emails"("payment_id");
