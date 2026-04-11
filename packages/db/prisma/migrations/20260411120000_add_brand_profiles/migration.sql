-- CreateTable: brand_profiles for per-brand contact info and notes
CREATE TABLE "brand_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand_name" VARCHAR(255) NOT NULL,
    "contact_email" VARCHAR(500),
    "contact_phone" VARCHAR(50),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique profile per user+brand
CREATE UNIQUE INDEX "brand_profiles_user_id_brand_name_key" ON "brand_profiles"("user_id", "brand_name");

-- CreateIndex: lookup by user
CREATE INDEX "brand_profiles_user_id_idx" ON "brand_profiles"("user_id");

-- AddForeignKey: cascade delete when user is deleted
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
