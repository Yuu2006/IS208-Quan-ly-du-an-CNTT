-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "account_role" AS ENUM ('ADMIN', 'FARMER', 'TRANSPORTER', 'WAREHOUSE', 'STORE', 'INSPECTOR');

-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "partner_type" AS ENUM ('FARM', 'TRANSPORT_COMPANY', 'STORE');

-- CreateEnum
CREATE TYPE "cooperation_status" AS ENUM ('PENDING', 'APPROVED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "batch_status" AS ENUM ('CREATED', 'AT_WAREHOUSE', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "certificate_type" AS ENUM ('VietGAP', 'GlobalGAP', 'HACCP', 'OTHER');

-- CreateEnum
CREATE TYPE "certificate_status" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "transport_status" AS ENUM ('PENDING_PICKUP', 'IN_TRANSIT', 'ARRIVED_WAREHOUSE', 'DELIVERED');

-- CreateEnum
CREATE TYPE "incident_type" AS ENUM ('DAMAGED', 'MISSING', 'QUALITY_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "qr_scan_result" AS ENUM ('SUCCESS', 'INACTIVE', 'NOT_FOUND');

-- CreateEnum
CREATE TYPE "qr_code_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "account" (
    "account_id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "role" "account_role" NOT NULL,
    "status" "account_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "account_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "partner_profile" (
    "partner_id" SERIAL NOT NULL,
    "account_id" INTEGER,
    "partner_type" "partner_type" NOT NULL,
    "partner_name" VARCHAR(200) NOT NULL,
    "tax_code" VARCHAR(20),
    "address" VARCHAR(500),
    "contact_person" VARCHAR(100),
    "cooperation_status" "cooperation_status" DEFAULT 'APPROVED',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "partner_profile_pkey" PRIMARY KEY ("partner_id")
);

-- CreateTable
CREATE TABLE "batch" (
    "batch_id" SERIAL NOT NULL,
    "batch_code" VARCHAR(50) NOT NULL,
    "farm_partner_id" INTEGER,
    "farming_methods" VARCHAR(200),
    "product_name" VARCHAR(200) NOT NULL,
    "product_type" VARCHAR(100),
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" VARCHAR(20) DEFAULT 'kg',
    "harvest_date" DATE,
    "packaged_date" DATE,
    "expiry_date" DATE,
    "status" "batch_status" DEFAULT 'CREATED',
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "batch_pkey" PRIMARY KEY ("batch_id")
);

-- CreateTable
CREATE TABLE "certificate" (
    "certificate_id" SERIAL NOT NULL,
    "issuer_partner_id" INTEGER,
    "cert_type" "certificate_type" NOT NULL,
    "issued_by" VARCHAR(200) NOT NULL,
    "issued_date" DATE NOT NULL,
    "expiry_date" DATE NOT NULL,
    "file_path" VARCHAR(500),
    "status" "certificate_status" DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_pkey" PRIMARY KEY ("certificate_id")
);

-- CreateTable
CREATE TABLE "batch_cert" (
    "batch_id" INTEGER NOT NULL,
    "certificate_id" INTEGER NOT NULL,
    "linked_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_cert_pkey" PRIMARY KEY ("batch_id","certificate_id")
);

-- CreateTable
CREATE TABLE "transport" (
    "transport_id" SERIAL NOT NULL,
    "batch_id" INTEGER,
    "shipper_partner_id" INTEGER,
    "receiver_partner_id" INTEGER,
    "driver_name" VARCHAR(100),
    "license_plate" VARCHAR(20),
    "transport_status" "transport_status" DEFAULT 'PENDING_PICKUP',
    "actual_departure" TIMESTAMP(3),
    "actual_arrival" TIMESTAMP(3),
    "delivery_confirmed_by" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "reason_cancel" VARCHAR(200),

    CONSTRAINT "transport_pkey" PRIMARY KEY ("transport_id")
);

-- CreateTable
CREATE TABLE "transport_checkpoint" (
    "checkpoint_id" SERIAL NOT NULL,
    "transport_id" INTEGER,
    "sequence" INTEGER NOT NULL,
    "location_name" VARCHAR(200),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "temperature" DECIMAL(4,1),
    "status_at_checkpoint" VARCHAR(50),
    "note" VARCHAR(500),
    "reported_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transport_checkpoint_pkey" PRIMARY KEY ("checkpoint_id")
);

-- CreateTable
CREATE TABLE "incident" (
    "incident_id" SERIAL NOT NULL,
    "transport_id" INTEGER,
    "batch_id" INTEGER,
    "reported_by" INTEGER,
    "incident_type" "incident_type" NOT NULL,
    "description" VARCHAR(1000),
    "quantity_affected" DECIMAL(12,2),
    "photo_path" VARCHAR(500),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_pkey" PRIMARY KEY ("incident_id")
);

-- CreateTable
CREATE TABLE "qr_code" (
    "qr_id" SERIAL NOT NULL,
    "batch_id" INTEGER,
    "qr_image_path" VARCHAR(500) NOT NULL,
    "status" "qr_code_status" DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_code_pkey" PRIMARY KEY ("qr_id")
);

-- CreateTable
CREATE TABLE "qr_scan_log" (
    "scan_id" BIGSERIAL NOT NULL,
    "qr_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "scan_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" VARCHAR(500),
    "ip_address" VARCHAR(45),
    "referer" VARCHAR(500),
    "scan_result" "qr_scan_result" DEFAULT 'SUCCESS',

    CONSTRAINT "qr_scan_log_pkey" PRIMARY KEY ("scan_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_username_key" ON "account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partner_profile_account_id_key" ON "partner_profile"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "batch_batch_code_key" ON "batch"("batch_code");

-- CreateIndex
CREATE INDEX "batch_farm_partner_id_idx" ON "batch"("farm_partner_id");

-- CreateIndex
CREATE INDEX "batch_created_by_idx" ON "batch"("created_by");

-- CreateIndex
CREATE INDEX "certificate_issuer_partner_id_idx" ON "certificate"("issuer_partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "transport_batch_id_key" ON "transport"("batch_id");

-- CreateIndex
CREATE INDEX "transport_shipper_partner_id_idx" ON "transport"("shipper_partner_id");

-- CreateIndex
CREATE INDEX "transport_receiver_partner_id_idx" ON "transport"("receiver_partner_id");

-- CreateIndex
CREATE INDEX "transport_delivery_confirmed_by_idx" ON "transport"("delivery_confirmed_by");

-- CreateIndex
CREATE INDEX "transport_checkpoint_transport_id_idx" ON "transport_checkpoint"("transport_id");

-- CreateIndex
CREATE INDEX "incident_transport_id_idx" ON "incident"("transport_id");

-- CreateIndex
CREATE INDEX "incident_batch_id_idx" ON "incident"("batch_id");

-- CreateIndex
CREATE INDEX "incident_reported_by_idx" ON "incident"("reported_by");

-- CreateIndex
CREATE UNIQUE INDEX "qr_code_batch_id_key" ON "qr_code"("batch_id");

-- CreateIndex
CREATE INDEX "qr_scan_log_qr_id_idx" ON "qr_scan_log"("qr_id");

-- CreateIndex
CREATE INDEX "qr_scan_log_batch_id_idx" ON "qr_scan_log"("batch_id");

-- AddCheckConstraint
ALTER TABLE "batch" ADD CONSTRAINT "batch_quantity_positive_check" CHECK ("quantity" > 0);

-- CreateFunction
CREATE OR REPLACE FUNCTION "set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CreateTrigger
CREATE TRIGGER "trg_account_set_updated_at"
BEFORE UPDATE ON "account"
FOR EACH ROW
EXECUTE FUNCTION "set_updated_at"();

-- CreateTrigger
CREATE TRIGGER "trg_partner_profile_set_updated_at"
BEFORE UPDATE ON "partner_profile"
FOR EACH ROW
EXECUTE FUNCTION "set_updated_at"();

-- CreateTrigger
CREATE TRIGGER "trg_batch_set_updated_at"
BEFORE UPDATE ON "batch"
FOR EACH ROW
EXECUTE FUNCTION "set_updated_at"();

-- CreateTrigger
CREATE TRIGGER "trg_transport_set_updated_at"
BEFORE UPDATE ON "transport"
FOR EACH ROW
EXECUTE FUNCTION "set_updated_at"();

-- AddForeignKey
ALTER TABLE "partner_profile" ADD CONSTRAINT "partner_profile_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_farm_partner_id_fkey" FOREIGN KEY ("farm_partner_id") REFERENCES "partner_profile"("partner_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "account"("account_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_issuer_partner_id_fkey" FOREIGN KEY ("issuer_partner_id") REFERENCES "partner_profile"("partner_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_cert" ADD CONSTRAINT "batch_cert_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_cert" ADD CONSTRAINT "batch_cert_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificate"("certificate_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport" ADD CONSTRAINT "transport_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport" ADD CONSTRAINT "transport_shipper_partner_id_fkey" FOREIGN KEY ("shipper_partner_id") REFERENCES "partner_profile"("partner_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport" ADD CONSTRAINT "transport_receiver_partner_id_fkey" FOREIGN KEY ("receiver_partner_id") REFERENCES "partner_profile"("partner_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport" ADD CONSTRAINT "transport_delivery_confirmed_by_fkey" FOREIGN KEY ("delivery_confirmed_by") REFERENCES "account"("account_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_checkpoint" ADD CONSTRAINT "transport_checkpoint_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "transport"("transport_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident" ADD CONSTRAINT "incident_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "transport"("transport_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident" ADD CONSTRAINT "incident_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident" ADD CONSTRAINT "incident_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "account"("account_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code" ADD CONSTRAINT "qr_code_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_log" ADD CONSTRAINT "qr_scan_log_qr_id_fkey" FOREIGN KEY ("qr_id") REFERENCES "qr_code"("qr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_log" ADD CONSTRAINT "qr_scan_log_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE RESTRICT ON UPDATE CASCADE;
