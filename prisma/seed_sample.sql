BEGIN;

TRUNCATE TABLE
  "qr_scan_log",
  "qr_code",
  "incident",
  "transport_checkpoint",
  "transport",
  "batch_cert",
  "certificate",
  "batch",
  "partner_profile",
  "account"
RESTART IDENTITY CASCADE;

INSERT INTO "account" (
  "account_id",
  "username",
  "password_hash",
  "full_name",
  "email",
  "phone",
  "role",
  "status",
  "created_at"
) VALUES
  (1, 'farmer01', '123', 'Nguyen Farm Owner', 'farmer01@example.com', '0901000001', 'FARMER', 'ACTIVE', '2026-05-01 08:00:00.000'),
  (2, 'farmer02', '123', 'Green Valley Manager', 'farmer02@example.com', '0901000002', 'FARMER', 'ACTIVE', '2026-05-01 08:05:00.000'),
  (3, 'transporter01', '123', 'Tran Logistics Driver', 'transporter01@example.com', '0901000003', 'TRANSPORTER', 'ACTIVE', '2026-05-01 08:10:00.000'),
  (4, 'store01', '123', 'Fresh Mart Receiver', 'store01@example.com', '0901000004', 'STORE', 'ACTIVE', '2026-05-01 08:15:00.000'),
  (5, 'inspector01', '123', 'Quality Inspector', 'inspector01@example.com', '0901000005', 'INSPECTOR', 'ACTIVE', '2026-05-01 08:20:00.000');

INSERT INTO "partner_profile" (
  "partner_id",
  "account_id",
  "partner_type",
  "partner_name",
  "tax_code",
  "address",
  "contact_person",
  "cooperation_status",
  "created_at"
) VALUES
  (1, 1, 'FARM', 'Sunny Farm Cooperative', 'FARM000001', 'Hamlet 1, Duc Trong, Lam Dong', 'Nguyen Farm Owner', 'APPROVED', '2026-05-01 09:00:00.000'),
  (2, 2, 'FARM', 'Green Valley Farm', 'FARM000002', 'Ward 5, Da Lat, Lam Dong', 'Green Valley Manager', 'APPROVED', '2026-05-01 09:05:00.000'),
  (3, 3, 'TRANSPORT_COMPANY', 'FastCool Logistics', 'LOG000003', 'District 7, Ho Chi Minh City', 'Tran Logistics Driver', 'APPROVED', '2026-05-01 09:10:00.000'),
  (4, 4, 'STORE', 'Fresh Mart Saigon', 'STORE0004', 'District 1, Ho Chi Minh City', 'Fresh Mart Receiver', 'APPROVED', '2026-05-01 09:15:00.000'),
  (5, 5, 'STORE', 'Quality Check Center', 'QC00000005', 'Thu Duc, Ho Chi Minh City', 'Quality Inspector', 'PENDING', '2026-05-01 09:20:00.000');

INSERT INTO "batch" (
  "batch_id",
  "batch_code",
  "farm_partner_id",
  "farming_methods",
  "product_name",
  "product_type",
  "quantity",
  "unit",
  "harvest_date",
  "packaged_date",
  "expiry_date",
  "status",
  "created_by",
  "created_at"
) VALUES
  (1, 'BATCH-2026-0001', 1, 'Organic compost, drip irrigation', 'Romaine Lettuce', 'Vegetable', 120.50, 'kg', '2026-05-10', '2026-05-11', '2026-05-18', 'CREATED', 1, '2026-05-11 07:30:00.000'),
  (2, 'BATCH-2026-0002', 1, 'Net house, biological pest control', 'Cherry Tomato', 'Vegetable', 200.00, 'kg', '2026-05-12', '2026-05-12', '2026-05-26', 'AT_WAREHOUSE', 1, '2026-05-12 08:30:00.000'),
  (3, 'BATCH-2026-0003', 2, 'Hydroponic production', 'Basil', 'Herb', 45.75, 'kg', '2026-05-14', '2026-05-14', '2026-05-20', 'IN_TRANSIT', 2, '2026-05-14 06:45:00.000'),
  (4, 'BATCH-2026-0004', 2, 'Greenhouse cultivation', 'Strawberry', 'Fruit', 80.25, 'kg', '2026-05-15', '2026-05-15', '2026-05-22', 'DELIVERED', 2, '2026-05-15 09:00:00.000'),
  (5, 'BATCH-2026-0005', 1, 'Integrated pest management', 'Cucumber', 'Vegetable', 150.00, 'kg', '2026-05-16', '2026-05-16', '2026-05-24', 'CANCELLED', 1, '2026-05-16 10:00:00.000');

INSERT INTO "certificate" (
  "certificate_id",
  "issuer_partner_id",
  "cert_type",
  "issued_by",
  "issued_date",
  "expiry_date",
  "file_path",
  "status",
  "created_at"
) VALUES
  (1, 1, 'VietGAP', 'Vietnam Agriculture Certification Center', '2026-01-01', '2027-01-01', '/uploads/certificates/vietgap-sunny-farm.pdf', 'ACTIVE', '2026-05-01 10:00:00.000'),
  (2, 1, 'GlobalGAP', 'Global Farm Assurance', '2026-02-01', '2027-02-01', '/uploads/certificates/globalgap-sunny-farm.pdf', 'ACTIVE', '2026-05-01 10:05:00.000'),
  (3, 2, 'HACCP', 'Food Safety Audit Group', '2026-03-01', '2027-03-01', '/uploads/certificates/haccp-green-valley.pdf', 'ACTIVE', '2026-05-01 10:10:00.000'),
  (4, 2, 'VietGAP', 'Vietnam Agriculture Certification Center', '2025-01-01', '2026-01-01', '/uploads/certificates/expired-green-valley.pdf', 'EXPIRED', '2026-05-01 10:15:00.000'),
  (5, 5, 'OTHER', 'Internal Quality Board', '2026-04-01', '2026-10-01', '/uploads/certificates/internal-qc.pdf', 'ACTIVE', '2026-05-01 10:20:00.000');

INSERT INTO "batch_cert" (
  "batch_id",
  "certificate_id",
  "linked_at"
) VALUES
  (1, 1, '2026-05-11 08:00:00.000'),
  (2, 2, '2026-05-12 09:00:00.000'),
  (3, 3, '2026-05-14 07:00:00.000'),
  (4, 3, '2026-05-15 09:30:00.000'),
  (5, 5, '2026-05-16 10:30:00.000');

INSERT INTO "transport" (
  "transport_id",
  "batch_id",
  "shipper_partner_id",
  "receiver_partner_id",
  "driver_name",
  "license_plate",
  "transport_status",
  "actual_departure",
  "actual_arrival",
  "delivery_confirmed_by",
  "created_at",
  "reason_cancel"
) VALUES
  (1, 1, 3, 4, 'Le Van A', '51C-10001', 'PENDING_PICKUP', NULL, NULL, NULL, '2026-05-11 12:00:00.000', NULL),
  (2, 2, 3, 4, 'Pham Van B', '51C-10002', 'ARRIVED_WAREHOUSE', '2026-05-12 13:00:00.000', '2026-05-12 18:30:00.000', NULL, '2026-05-12 12:00:00.000', NULL),
  (3, 3, 3, 4, 'Hoang Van C', '51C-10003', 'IN_TRANSIT', '2026-05-14 11:00:00.000', NULL, NULL, '2026-05-14 10:30:00.000', NULL),
  (4, 4, 3, 4, 'Do Van D', '51C-10004', 'DELIVERED', '2026-05-15 11:00:00.000', '2026-05-15 17:00:00.000', 4, '2026-05-15 10:30:00.000', NULL),
  (5, 5, 3, 4, 'Vu Van E', '51C-10005', 'PENDING_PICKUP', NULL, NULL, NULL, '2026-05-16 11:00:00.000', 'Batch cancelled before pickup');

INSERT INTO "transport_checkpoint" (
  "checkpoint_id",
  "transport_id",
  "sequence",
  "location_name",
  "latitude",
  "longitude",
  "temperature",
  "status_at_checkpoint",
  "note",
  "reported_at"
) VALUES
  (1, 1, 1, 'Sunny Farm Gate', 11.7350000, 108.3730000, 6.5, 'WAITING_PICKUP', 'Truck assigned and waiting', '2026-05-11 12:15:00.000'),
  (2, 2, 1, 'Da Lat Warehouse', 11.9404000, 108.4583000, 5.8, 'ARRIVED_WAREHOUSE', 'Goods stored in cold room', '2026-05-12 18:35:00.000'),
  (3, 3, 1, 'Bao Loc Checkpoint', 11.5475000, 107.8077000, 6.1, 'IN_TRANSIT', 'Temperature stable', '2026-05-14 14:00:00.000'),
  (4, 4, 1, 'Fresh Mart Receiving Dock', 10.7769000, 106.7009000, 5.9, 'DELIVERED', 'Delivery accepted', '2026-05-15 17:10:00.000'),
  (5, 5, 1, 'Green Dispatch Office', 11.7352000, 108.3725000, 7.0, 'CANCELLED', 'Pickup cancelled by farm', '2026-05-16 11:15:00.000');

INSERT INTO "incident" (
  "incident_id",
  "transport_id",
  "batch_id",
  "reported_by",
  "incident_type",
  "description",
  "quantity_affected",
  "photo_path",
  "created_at"
) VALUES
  (1, 1, 1, 3, 'OTHER', 'Pickup delayed due to loading queue', 0.00, NULL, '2026-05-11 12:30:00.000'),
  (2, 2, 2, 5, 'QUALITY_ISSUE', 'Some cartons had minor condensation', 3.50, '/uploads/incidents/batch-0002-condensation.jpg', '2026-05-12 19:00:00.000'),
  (3, 3, 3, 3, 'DAMAGED', 'One herb crate dented during transit', 2.00, '/uploads/incidents/batch-0003-dented-crate.jpg', '2026-05-14 15:30:00.000'),
  (4, 4, 4, 4, 'MISSING', 'Short count found at receiving dock', 1.25, '/uploads/incidents/batch-0004-short-count.jpg', '2026-05-15 17:30:00.000'),
  (5, 5, 5, 1, 'OTHER', 'Batch cancelled because of buyer request', 0.00, NULL, '2026-05-16 11:30:00.000');

INSERT INTO "qr_code" (
  "qr_id",
  "batch_id",
  "qr_image_path",
  "status",
  "created_at"
) VALUES
  (1, 1, '/uploads/qrcodes/batch-2026-0001.png', 'ACTIVE', '2026-05-11 08:15:00.000'),
  (2, 2, '/uploads/qrcodes/batch-2026-0002.png', 'ACTIVE', '2026-05-12 09:15:00.000'),
  (3, 3, '/uploads/qrcodes/batch-2026-0003.png', 'ACTIVE', '2026-05-14 07:15:00.000'),
  (4, 4, '/uploads/qrcodes/batch-2026-0004.png', 'ACTIVE', '2026-05-15 09:45:00.000'),
  (5, 5, '/uploads/qrcodes/batch-2026-0005.png', 'INACTIVE', '2026-05-16 10:45:00.000');

INSERT INTO "qr_scan_log" (
  "scan_id",
  "qr_id",
  "batch_id",
  "scan_timestamp",
  "user_agent",
  "ip_address",
  "referer",
  "scan_result"
) VALUES
  (1, 1, 1, '2026-05-11 09:00:00.000', 'Mozilla/5.0 Seed Client', '192.168.1.11', 'https://test.local/batches/BATCH-2026-0001', 'SUCCESS'),
  (2, 2, 2, '2026-05-12 10:00:00.000', 'Mozilla/5.0 Seed Client', '192.168.1.12', 'https://test.local/batches/BATCH-2026-0002', 'SUCCESS'),
  (3, 3, 3, '2026-05-14 08:00:00.000', 'Mozilla/5.0 Seed Client', '192.168.1.13', 'https://test.local/batches/BATCH-2026-0003', 'SUCCESS'),
  (4, 4, 4, '2026-05-15 10:00:00.000', 'Mozilla/5.0 Seed Client', '192.168.1.14', 'https://test.local/batches/BATCH-2026-0004', 'SUCCESS'),
  (5, 5, 5, '2026-05-16 11:00:00.000', 'Mozilla/5.0 Seed Client', '192.168.1.15', 'https://test.local/batches/BATCH-2026-0005', 'INACTIVE');

SELECT setval(pg_get_serial_sequence('"account"', 'account_id'), 5, true);
SELECT setval(pg_get_serial_sequence('"partner_profile"', 'partner_id'), 5, true);
SELECT setval(pg_get_serial_sequence('"batch"', 'batch_id'), 5, true);
SELECT setval(pg_get_serial_sequence('"certificate"', 'certificate_id'), 5, true);
SELECT setval(pg_get_serial_sequence('"transport"', 'transport_id'), 5, true);
SELECT setval(pg_get_serial_sequence('"transport_checkpoint"', 'checkpoint_id'), 5, true);
SELECT setval(pg_get_serial_sequence('"incident"', 'incident_id'), 5, true);
SELECT setval(pg_get_serial_sequence('"qr_code"', 'qr_id'), 5, true);
SELECT setval(pg_get_serial_sequence('"qr_scan_log"', 'scan_id'), 5, true);

COMMIT;
