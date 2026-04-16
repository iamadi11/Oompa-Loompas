-- CreateTable
CREATE TABLE "deal_templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "default_value" DECIMAL(15,2),
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_template_deliverables" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "platform" "DeliverablePlatform" NOT NULL,
    "type" "DeliverableType" NOT NULL,
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "deal_template_deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_template_payments" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "deal_template_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deal_templates_user_id_idx" ON "deal_templates"("user_id");

-- CreateIndex
CREATE INDEX "deal_template_deliverables_template_id_idx" ON "deal_template_deliverables"("template_id");

-- CreateIndex
CREATE INDEX "deal_template_payments_template_id_idx" ON "deal_template_payments"("template_id");

-- AddForeignKey
ALTER TABLE "deal_templates" ADD CONSTRAINT "deal_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_template_deliverables" ADD CONSTRAINT "deal_template_deliverables_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "deal_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_template_payments" ADD CONSTRAINT "deal_template_payments_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "deal_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
