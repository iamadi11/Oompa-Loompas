-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('DRAFT', 'NEGOTIATING', 'ACTIVE', 'DELIVERED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'RECEIVED', 'OVERDUE', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "DeliverableStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliverablePlatform" AS ENUM ('INSTAGRAM', 'YOUTUBE', 'TWITTER', 'LINKEDIN', 'PODCAST', 'BLOG', 'OTHER');

-- CreateEnum
CREATE TYPE "DeliverableType" AS ENUM ('POST', 'REEL', 'STORY', 'VIDEO', 'INTEGRATION', 'MENTION', 'ARTICLE', 'OTHER');

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "brand_name" VARCHAR(255) NOT NULL,
    "value" DECIMAL(15,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "status" "DealStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverables" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "platform" "DeliverablePlatform" NOT NULL,
    "type" "DeliverableType" NOT NULL,
    "due_date" TIMESTAMP(3),
    "status" "DeliverableStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deals_status_idx" ON "deals"("status");

-- CreateIndex
CREATE INDEX "deals_brand_name_idx" ON "deals"("brand_name");

-- CreateIndex
CREATE INDEX "deals_created_at_idx" ON "deals"("created_at" DESC);

-- CreateIndex
CREATE INDEX "payments_deal_id_idx" ON "payments"("deal_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_due_date_idx" ON "payments"("due_date");

-- CreateIndex
CREATE INDEX "deliverables_deal_id_idx" ON "deliverables"("deal_id");

-- CreateIndex
CREATE INDEX "deliverables_status_idx" ON "deliverables"("status");

-- CreateIndex
CREATE INDEX "deliverables_due_date_idx" ON "deliverables"("due_date");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
