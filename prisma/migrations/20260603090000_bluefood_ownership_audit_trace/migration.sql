-- Account data ownership.
ALTER TYPE "batch_status" ADD VALUE IF NOT EXISTS 'INCIDENT_REPORTED';
ALTER TYPE "transport_status" ADD VALUE IF NOT EXISTS 'INCIDENT_REPORTED';

ALTER TABLE "account" ADD COLUMN "partner_id" INTEGER;
UPDATE "account" a
SET "partner_id" = p."partner_id"
FROM "partner_profile" p
WHERE p."account_id" = a."account_id"
  AND a."partner_id" IS NULL;
CREATE INDEX "account_partner_id_idx" ON "account"("partner_id");
ALTER TABLE "account" ADD CONSTRAINT "account_partner_id_fkey"
FOREIGN KEY ("partner_id") REFERENCES "partner_profile"("partner_id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Batch inventory/location fields.
ALTER TABLE "batch" ADD COLUMN "current_quantity" DECIMAL(12,2);
ALTER TABLE "batch" ADD COLUMN "current_location_partner_id" INTEGER;
UPDATE "batch"
SET "current_quantity" = "quantity"
WHERE "current_quantity" IS NULL;
UPDATE "batch"
SET "current_location_partner_id" = "farm_partner_id"
WHERE "current_location_partner_id" IS NULL;
CREATE INDEX "batch_current_location_partner_id_idx" ON "batch"("current_location_partner_id");
ALTER TABLE "batch" ADD CONSTRAINT "batch_current_location_partner_id_fkey"
FOREIGN KEY ("current_location_partner_id") REFERENCES "partner_profile"("partner_id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "batch" ADD CONSTRAINT "batch_current_quantity_non_negative_check" CHECK ("current_quantity" IS NULL OR "current_quantity" >= 0);
ALTER TABLE "batch" ADD CONSTRAINT "batch_current_quantity_lte_quantity_check" CHECK ("current_quantity" IS NULL OR "current_quantity" <= "quantity");

-- Transport ownership fields. Existing shipper/receiver values are copied forward.
ALTER TABLE "transport" ADD COLUMN "farm_partner_id" INTEGER;
ALTER TABLE "transport" ADD COLUMN "store_partner_id" INTEGER;
ALTER TABLE "transport" ADD COLUMN "transporter_partner_id" INTEGER;
ALTER TABLE "transport" ADD COLUMN "expected_arrival_time" TIMESTAMP(3);
ALTER TABLE "transport" ADD COLUMN "created_by" INTEGER;
UPDATE "transport"
SET "farm_partner_id" = "shipper_partner_id"
WHERE "farm_partner_id" IS NULL;
UPDATE "transport"
SET "store_partner_id" = "receiver_partner_id"
WHERE "store_partner_id" IS NULL;
CREATE INDEX "transport_farm_partner_id_idx" ON "transport"("farm_partner_id");
CREATE INDEX "transport_store_partner_id_idx" ON "transport"("store_partner_id");
CREATE INDEX "transport_transporter_partner_id_idx" ON "transport"("transporter_partner_id");
CREATE INDEX "transport_created_by_idx" ON "transport"("created_by");
ALTER TABLE "transport" ADD CONSTRAINT "transport_farm_partner_id_fkey"
FOREIGN KEY ("farm_partner_id") REFERENCES "partner_profile"("partner_id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transport" ADD CONSTRAINT "transport_store_partner_id_fkey"
FOREIGN KEY ("store_partner_id") REFERENCES "partner_profile"("partner_id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transport" ADD CONSTRAINT "transport_transporter_partner_id_fkey"
FOREIGN KEY ("transporter_partner_id") REFERENCES "partner_profile"("partner_id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transport" ADD CONSTRAINT "transport_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "account"("account_id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- QR trace token.
ALTER TABLE "qr_code" ADD COLUMN "trace_token" VARCHAR(80);
ALTER TABLE "qr_code" ADD COLUMN "qr_url" VARCHAR(500);
UPDATE "qr_code"
SET "trace_token" = 'legacy-' || "qr_id"::TEXT || '-' || COALESCE("batch_id"::TEXT, 'unlinked'),
    "qr_url" = "qr_image_path"
WHERE "trace_token" IS NULL;
ALTER TABLE "qr_code" ALTER COLUMN "trace_token" SET NOT NULL;
CREATE UNIQUE INDEX "qr_code_trace_token_key" ON "qr_code"("trace_token");

-- Internal audit log, append-only.
CREATE TABLE "audit_log" (
    "audit_id" BIGSERIAL NOT NULL,
    "actor_id" INTEGER,
    "action" VARCHAR(100) NOT NULL,
    "object_type" VARCHAR(100) NOT NULL,
    "object_id" VARCHAR(100) NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("audit_id")
);
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log"("actor_id");
CREATE INDEX "audit_log_object_type_object_id_idx" ON "audit_log"("object_type", "object_id");
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey"
FOREIGN KEY ("actor_id") REFERENCES "account"("account_id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION "block_audit_log_mutation"()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_audit_log_no_update"
BEFORE UPDATE ON "audit_log"
FOR EACH ROW
EXECUTE FUNCTION "block_audit_log_mutation"();

CREATE TRIGGER "trg_audit_log_no_delete"
BEFORE DELETE ON "audit_log"
FOR EACH ROW
EXECUTE FUNCTION "block_audit_log_mutation"();

-- Public traceability timeline.
CREATE TABLE "batch_status_history" (
    "history_id" BIGSERIAL NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "status" "batch_status" NOT NULL,
    "location_name" VARCHAR(200),
    "note" VARCHAR(500),
    "changed_by" INTEGER,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_status_history_pkey" PRIMARY KEY ("history_id")
);
CREATE INDEX "batch_status_history_batch_id_idx" ON "batch_status_history"("batch_id");
CREATE INDEX "batch_status_history_changed_by_idx" ON "batch_status_history"("changed_by");
CREATE INDEX "batch_status_history_changed_at_idx" ON "batch_status_history"("changed_at");
ALTER TABLE "batch_status_history" ADD CONSTRAINT "batch_status_history_batch_id_fkey"
FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id")
ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "batch_status_history" ADD CONSTRAINT "batch_status_history_changed_by_fkey"
FOREIGN KEY ("changed_by") REFERENCES "account"("account_id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "batch_status_history" ("batch_id", "status", "location_name", "note", "changed_by", "changed_at")
SELECT
    b."batch_id",
    COALESCE(b."status", 'CREATED'::"batch_status"),
    COALESCE(p."partner_name", p."address"),
    'Imported from existing batch state',
    b."created_by",
    COALESCE(b."created_at", CURRENT_TIMESTAMP)
FROM "batch" b
LEFT JOIN "partner_profile" p ON p."partner_id" = b."farm_partner_id";
