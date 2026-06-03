# BlueFood API Design

Tai lieu nay thiet ke API dua tren `UC_All_Use_Cases.md` va schema Prisma hien tai.

## 1. Nguyen tac chung

Base URL:

```text
/api/v1
```

Response thanh cong:

```json
{
  "data": {},
  "meta": {}
}
```

Response loi:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Du lieu khong hop le",
    "details": {}
  }
}
```

Phan trang danh sach:

```text
?page=1&pageSize=20&sort=createdAt:desc
```

Quy uoc quyen:

| Role | Mo ta |
| --- | --- |
| `ADMIN` | Quan tri he thong, quan ly tai khoan, doi tac, bao cao, audit log |
| `FARMER` | Tao/cap nhat lo hang, chung chi, QR cho lo hang cua nong trai |
| `TRANSPORTER` | Cap nhat van chuyen, checkpoint, su co trong qua trinh giao |
| `WAREHOUSE` | Theo doi lo hang trong kho BlueFood |
| `STORE` | Xac nhan nhan hang, bao cao loi hang |
| `INSPECTOR` | Xem va kiem tra ho so, chung chi, lich su chuoi cung ung |

Header xac thuc:

```text
Authorization: Bearer <accessToken>
```

## 2. Auth va tai khoan

Mapping UC: UC01, UC02, UC03, UC04, UC05, UC06, UC07.

| Method | Endpoint | Role | UC | Mo ta |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/login` | Public | UC02 | Dang nhap bang username/email va password |
| `POST` | `/auth/logout` | Authenticated | UC03 | Dang xuat, vo hieu hoa refresh token neu co |
| `GET` | `/auth/me` | Authenticated | UC05 | Lay thong tin tai khoan hien tai |
| `PATCH` | `/auth/me` | Authenticated | UC05 | Cap nhat ho ten, email, phone cua chinh minh |
| `GET` | `/accounts` | ADMIN | UC01 | Danh sach tai khoan, loc theo role/status/search |
| `POST` | `/accounts` | ADMIN | UC04 | Tao tai khoan moi |
| `GET` | `/accounts/:accountId` | ADMIN | UC01 | Chi tiet tai khoan |
| `PATCH` | `/accounts/:accountId` | ADMIN | UC05, UC06 | Cap nhat thong tin va role |
| `PATCH` | `/accounts/:accountId/status` | ADMIN | UC07 | Khoa/mo khoa tai khoan |

`POST /auth/login`

```json
{
  "username": "admin",
  "password": "secret"
}
```

`POST /accounts`

```json
{
  "username": "farm01",
  "password": "secret",
  "fullName": "Dai dien Nong trai A",
  "email": "farm01@example.com",
  "phone": "0900000000",
  "role": "FARMER"
}
```

## 3. Lo hang

Mapping UC: UC08, UC09, UC10, UC11, UC12, UC13.

| Method | Endpoint | Role | UC | Mo ta |
| --- | --- | --- | --- | --- |
| `GET` | `/batches` | Authenticated | UC12, UC13 | Danh sach/tra cuu lo hang |
| `POST` | `/batches` | FARMER, ADMIN | UC09 | Tao lo hang moi |
| `GET` | `/batches/:batchId` | Authenticated | UC13 | Chi tiet lo hang |
| `GET` | `/batches/code/:batchCode` | Authenticated/Public QR | UC13 | Chi tiet theo ma lo |
| `PATCH` | `/batches/:batchId` | FARMER, ADMIN | UC10 | Cap nhat khi lo chua xuat kho/van chuyen |
| `PATCH` | `/batches/:batchId/cancel` | FARMER, ADMIN | UC11 | Huy lo hang, doi status `CANCELLED` |

Query de tra cuu:

```text
GET /batches?search=rau&batchCode=BATCH001&productName=rau&farmPartnerId=1&status=CREATED&fromDate=2026-01-01&toDate=2026-12-31
```

`POST /batches`

```json
{
  "batchCode": "BATCH-2026-001",
  "farmPartnerId": 1,
  "productName": "Rau cai",
  "productType": "Rau an la",
  "quantity": "250.50",
  "unit": "kg",
  "farmingMethods": "VietGAP",
  "harvestDate": "2026-05-30",
  "packagedDate": "2026-05-30",
  "expiryDate": "2026-06-06"
}
```

Business rules:

| Dieu kien | Xu ly |
| --- | --- |
| Cap nhat lo hang | Chi cho phep khi `status` la `CREATED` hoac `AT_WAREHOUSE` va chua co van chuyen dang chay |
| Huy lo hang | Doi `status` sang `CANCELLED`, khong xoa vat ly neu da co QR/chung chi/van chuyen |
| Danh sach theo role | FARMER xem lo cua partner minh, TRANSPORTER xem lo co transport duoc gan, STORE xem lo giao den cua hang minh |

## 4. Chung chi

Mapping UC: UC14, UC15, UC16, UC17, UC18.

| Method | Endpoint | Role | UC | Mo ta |
| --- | --- | --- | --- | --- |
| `GET` | `/certificates` | Authenticated | UC18 | Danh sach chung chi, loc theo issuer/status/type |
| `POST` | `/certificates` | FARMER, ADMIN | UC15 | Tao metadata chung chi va file path |
| `GET` | `/certificates/:certificateId` | Authenticated | UC18 | Chi tiet chung chi |
| `PATCH` | `/certificates/:certificateId` | FARMER, ADMIN | UC16 | Cap nhat thong tin/file chung chi |
| `DELETE` | `/certificates/:certificateId` | FARMER, ADMIN | UC17 | Go chung chi neu chua van chuyen |
| `POST` | `/batches/:batchId/certificates` | FARMER, ADMIN | UC15 | Gan chung chi vao lo hang |
| `GET` | `/batches/:batchId/certificates` | Authenticated/Public QR | UC18 | Xem chung chi cua lo hang |
| `DELETE` | `/batches/:batchId/certificates/:certificateId` | FARMER, ADMIN | UC17 | Go lien ket chung chi khoi lo |

`POST /certificates`

```json
{
  "issuerPartnerId": 1,
  "certType": "VietGAP",
  "issuedBy": "Trung tam chung nhan A",
  "issuedDate": "2026-01-01",
  "expiryDate": "2027-01-01",
  "filePath": "/uploads/certificates/vietgap-a.pdf"
}
```

Ghi chu: neu can upload file truc tiep, dung `multipart/form-data` tai `POST /uploads/certificates`, sau do luu `filePath`.

## 5. Van chuyen va su co

Mapping UC: UC19, UC20, UC21, UC22, UC23, UC24, UC25.

| Method | Endpoint | Role | UC | Mo ta |
| --- | --- | --- | --- | --- |
| `GET` | `/transports` | ADMIN, TRANSPORTER, STORE | UC19 | Danh sach van chuyen |
| `POST` | `/transports` | ADMIN | UC20 | Tao don van chuyen cho lo hang |
| `GET` | `/transports/:transportId` | ADMIN, TRANSPORTER, STORE | UC19, UC23 | Chi tiet van chuyen |
| `PATCH` | `/transports/:transportId` | ADMIN, TRANSPORTER | UC22 | Cap nhat tai xe, bien so, doi tac |
| `PATCH` | `/transports/:transportId/status` | TRANSPORTER, ADMIN | UC21 | Cap nhat trang thai van chuyen |
| `POST` | `/transports/:transportId/checkpoints` | TRANSPORTER | UC21 | Them diem kiem soat vi tri/nhiet do |
| `GET` | `/transports/:transportId/checkpoints` | ADMIN, TRANSPORTER, STORE | UC23 | Xem hanh trinh |
| `POST` | `/transports/:transportId/confirm-delivery` | STORE, ADMIN | UC24 | Xac nhan nhan hang |
| `POST` | `/incidents` | STORE, TRANSPORTER, ADMIN | UC25 | Bao cao loi lo hang |
| `GET` | `/incidents` | ADMIN, STORE, TRANSPORTER | UC25 | Danh sach su co |

`POST /transports`

```json
{
  "batchId": 1,
  "shipperPartnerId": 2,
  "receiverPartnerId": 3,
  "driverName": "Nguyen Van A",
  "licensePlate": "51A-12345"
}
```

`POST /transports/:transportId/checkpoints`

```json
{
  "sequence": 1,
  "locationName": "Kho BlueFood",
  "latitude": "10.762622",
  "longitude": "106.660172",
  "temperature": "4.5",
  "statusAtCheckpoint": "IN_TRANSIT",
  "note": "Hang hoa binh thuong"
}
```

`POST /incidents`

```json
{
  "transportId": 1,
  "batchId": 1,
  "incidentType": "DAMAGED",
  "description": "Thung hang bi rach",
  "quantityAffected": "5.00",
  "photoPath": "/uploads/incidents/photo.jpg"
}
```

## 6. Audit log

Mapping UC: UC26, UC27, UC28.

| Method | Endpoint | Role | UC | Mo ta |
| --- | --- | --- | --- | --- |
| `GET` | `/audit-logs/summary` | ADMIN | UC26 | Thong ke tong quan log |
| `GET` | `/audit-logs` | ADMIN | UC28 | Tra cuu log theo actor/action/entity/date |
| `GET` | `/batches/:batchId/audit-logs` | ADMIN | UC27 | Lich su thay doi cua mot lo hang |

Schema hien tai chua co bang audit log. Nen bo sung:

```prisma
model AuditLog {
  auditId    BigInt   @id @default(autoincrement()) @map("audit_id")
  actorId    Int?     @map("actor_id")
  action     String   @db.VarChar(100)
  entityType String   @map("entity_type") @db.VarChar(100)
  entityId   String   @map("entity_id") @db.VarChar(100)
  oldValue   Json?    @map("old_value")
  newValue   Json?    @map("new_value")
  ipAddress  String?  @map("ip_address") @db.VarChar(45)
  userAgent  String?  @map("user_agent") @db.VarChar(500)
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamp(3)

  @@index([entityType, entityId])
  @@index([actorId])
  @@index([createdAt])
  @@map("audit_log")
}
```

API audit log chi co `GET`; khong cung cap `POST`, `PATCH`, `DELETE` public vi module append-only.

## 7. Lich su chuoi cung ung va truy xuat nguon goc

Mapping UC: UC29, UC30, UC31.

| Method | Endpoint | Role | UC | Mo ta |
| --- | --- | --- | --- | --- |
| `GET` | `/traceability/batches/:batchCode/origin` | Public/Auth | UC30 | Nguon goc ban dau cua lo hang |
| `GET` | `/traceability/batches/:batchCode/timeline` | Public/Auth | UC31 | Timeline tu nong trai den cua hang |
| `GET` | `/traceability/batches/:batchCode` | Public/Auth | UC30, UC31 | Du lieu tong hop cho man hinh truy xuat |

Response tong hop nen gom:

```json
{
  "batch": {},
  "origin": {
    "farmPartner": {},
    "harvestDate": "2026-05-30",
    "farmingMethods": "VietGAP"
  },
  "certificates": [],
  "transport": {
    "status": "IN_TRANSIT",
    "checkpoints": []
  },
  "incidents": [],
  "qr": {}
}
```

## 8. QR dinh danh

Mapping UC: UC32, UC33, UC34, UC35.

| Method | Endpoint | Role | UC | Mo ta |
| --- | --- | --- | --- | --- |
| `POST` | `/batches/:batchId/qr` | FARMER, ADMIN | UC33 | Tao QR duy nhat cho lo hang |
| `GET` | `/qr-codes` | ADMIN, FARMER | UC32 | Danh sach QR |
| `GET` | `/qr-codes/:qrId` | Authenticated | UC32 | Chi tiet QR |
| `GET` | `/qr-codes/:qrId/download` | FARMER, ADMIN | UC35 | Tai anh QR |
| `POST` | `/qr-codes/:qrId/scan` | Public | UC34 | Ghi nhan luot quet va tra ve truy xuat |
| `PATCH` | `/qr-codes/:qrId/status` | FARMER, ADMIN | UC32 | Active/inactive QR |

`POST /qr-codes/:qrId/scan` se tao `QrScanLog`, ghi `userAgent`, `ipAddress`, `referer`, va tra ve data tu `/traceability/batches/:batchCode`.

## 9. Ho so doi tac

Mapping UC: UC36, UC37, UC38, UC39, UC40.

| Method | Endpoint | Role | UC | Mo ta |
| --- | --- | --- | --- | --- |
| `GET` | `/partners` | ADMIN, INSPECTOR | UC39 | Danh sach/tra cuu doi tac |
| `POST` | `/partners` | ADMIN | UC37 | Tao ho so doi tac |
| `GET` | `/partners/:partnerId` | ADMIN, INSPECTOR, Partner owner | UC39 | Chi tiet ho so |
| `PATCH` | `/partners/:partnerId` | ADMIN, Partner owner | UC38 | Cap nhat ho so |
| `PATCH` | `/partners/:partnerId/status` | ADMIN | UC40 | Doi trang thai hop tac |
| `DELETE` | `/partners/:partnerId` | ADMIN | UC40 | Xoa vat ly neu chua co giao dich |

`POST /partners`

```json
{
  "accountId": 2,
  "partnerType": "FARM",
  "partnerName": "Nong trai A",
  "taxCode": "0312345678",
  "address": "Long An",
  "contactPerson": "Nguyen Van B",
  "cooperationStatus": "APPROVED"
}
```

Ghi chu UC38 co noi "gui yeu cau cho duyet"; schema hien tai chua co bang pending request. Neu can dung workflow duyet that su, bo sung `PartnerChangeRequest`.

## 10. Bao cao va thong ke

Mapping UC: UC41, UC42, UC43, UC44, UC45.

| Method | Endpoint | Role | UC | Mo ta |
| --- | --- | --- | --- | --- |
| `GET` | `/reports/dashboard` | ADMIN | UC41 | Tong quan dashboard |
| `GET` | `/reports/batches/statistics` | ADMIN | UC42 | Thong ke lo hang theo thoi gian/trang thai/nha cung cap |
| `GET` | `/reports/qr/statistics` | ADMIN | UC42 | So QR da tao va so luot quet |
| `GET` | `/reports/inventory` | ADMIN, WAREHOUSE | UC44 | Ton kho hien tai theo lo hang |
| `GET` | `/reports/expiry-alerts` | ADMIN, WAREHOUSE, STORE | UC45 | Lo hang sap het han |
| `GET` | `/reports/export` | ADMIN | UC43 | Xuat PDF/Excel |

Query export:

```text
GET /reports/export?type=batch-statistics&format=xlsx&fromDate=2026-01-01&toDate=2026-12-31
```

Ghi chu: ton kho hien tai dang suy ra tu `Batch.status` va `quantity`. Neu can ton kho theo kho/cua hang, can bo sung bang inventory transaction.

## 11. Mapping UC sang endpoint chinh

| UC | Endpoint chinh |
| --- | --- |
| UC02, UC03 | `/auth/login`, `/auth/logout` |
| UC04-UC07 | `/accounts`, `/accounts/:accountId`, `/accounts/:accountId/status` |
| UC09-UC13 | `/batches`, `/batches/:batchId`, `/batches/:batchId/cancel` |
| UC15-UC18 | `/certificates`, `/batches/:batchId/certificates` |
| UC20-UC25 | `/transports`, `/transports/:transportId/checkpoints`, `/incidents` |
| UC26-UC28 | `/audit-logs`, `/batches/:batchId/audit-logs` |
| UC30-UC31 | `/traceability/batches/:batchCode` |
| UC33-UC35 | `/batches/:batchId/qr`, `/qr-codes/:qrId/scan`, `/qr-codes/:qrId/download` |
| UC37-UC40 | `/partners`, `/partners/:partnerId/status` |
| UC42-UC45 | `/reports/*` |

## 12. De xuat thu tu implement

1. Auth + account + role guard.
2. Partner profile.
3. Batch CRUD/search.
4. Certificate metadata + file upload.
5. Transport/checkpoint/incident.
6. QR generate/scan + traceability public API.
7. AuditLog middleware va endpoint read-only.
8. Reports/export.
