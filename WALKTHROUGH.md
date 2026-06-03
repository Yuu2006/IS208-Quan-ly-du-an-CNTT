# BlueFood Walkthrough

File này là bản điều phối kỹ thuật hiện tại của repo. Tài liệu nghiệp vụ chi tiết vẫn nằm trong [docs/usecases](docs/usecases), còn checklist triển khai dài nằm trong [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md).

## 1. Quy tắc làm việc bắt buộc

- [x] Tách repo thành `be`, `fe/admin`, `fe/mobile/app`, `docs`.
- [x] Có README root mô tả setup, cấu trúc, scripts và ràng buộc nghiệp vụ.
- [x] Dùng trực tiếp `.env` thật cho backend, admin web và mobile web.
- [x] Đã khởi tạo `.env` local: backend từ file local sẵn có, admin/mobile theo cấu hình local.
- [x] Có root `.gitignore` để loại `.env`, `env`, `node_modules`, build output, log và Prisma generated client.
- [x] Có root `package.json` điều phối cài đặt/build/dev cho các app.
- [ ] Không commit credential thật; nếu đã từng đưa secret vào repo, cần rotate credential ở nhà cung cấp database.
- [ ] Mỗi PR/commit nghiệp vụ phải gắn với UC tương ứng.
- [ ] Khi thêm/sửa endpoint, cập nhật [be/docs/API_DESIGN.md](be/docs/API_DESIGN.md).
- [ ] Khi đổi luồng nghiệp vụ, cập nhật file use case trong [docs/usecases](docs/usecases).
- [ ] Mọi thao tác thay đổi dữ liệu nghiệp vụ quan trọng phải có audit log append-only.

## 2. Ma trận use case và module

| Nhóm nghiệp vụ | Use case | Module chính | Hiện trạng |
| --- | --- | --- | --- |
| Tài khoản & xác thực | UC01-UC07 | Backend auth/account, admin accounts | Có login/register/customer, danh sách account; thiếu logout/me/đổi mật khẩu/RBAC đầy đủ/audit |
| Lô hàng | UC08-UC13 | Backend batch, mobile farm, admin shipping | Có list/create/detail theo `batchCode`; thiếu update/cancel đầy đủ và audit |
| Chứng chỉ | UC14-UC18 | Backend batch certificates, mobile farm | Có gắn/xóa chứng chỉ theo lô; thiếu upload file thật và kiểm soát xóa theo trạng thái đầy đủ |
| Vận chuyển | UC19-UC25 | Backend transports/store, mobile transporter/store | Có list transport, assign, checkpoint, confirm delivery, report issue; cần chuẩn hóa status/audit/role guard |
| Audit log | UC26-UC28 | Admin audit, backend audit service | UI mock có màn hình; backend/schema chưa có bảng/service audit append-only đầy đủ |
| Lịch sử chuỗi cung ứng | UC29-UC31 | QR trace, batch detail, transport history | Có dữ liệu batch/transport/QR nền; cần endpoint trace public tổng hợp theo UC |
| QR định danh | UC32-UC35 | Backend QR, mobile scanner | Có `GET /api/qr/:qrId` và UI scan; thiếu tạo/in/tải QR đầy đủ, chữ ký/xác thực QR |
| Hồ sơ đối tác | UC36-UC40 | Backend partners, admin partners | Có list partner/store/transporter; thiếu CRUD/phê duyệt cập nhật/khóa theo giao dịch |
| Báo cáo & thống kê | UC41-UC45 | Admin reports | UI mock có báo cáo; backend aggregate/export/inventory/expiry alert chưa đầy đủ |

## 3. Backend

### Đã có

- [x] Express app trong [be/src/app.ts](be/src/app.ts).
- [x] Server bootstrap và graceful shutdown trong [be/src/server.ts](be/src/server.ts).
- [x] Prisma schema và migration đầu tiên trong [be/prisma](be/prisma).
- [x] Prisma client wrapper trong [be/src/lib/prisma.ts](be/src/lib/prisma.ts).
- [x] API route chính trong [be/src/routes/api.ts](be/src/routes/api.ts).
- [x] Health check database: `GET /api/health`.
- [x] Runtime JSON safe cho `bigint`/`Decimal`.

### Endpoint hiện có

- [x] `POST /api/auth/login`
- [x] `POST /api/auth/register-customer`
- [x] `GET /api/accounts`
- [x] `GET /api/transporters`
- [x] `GET /api/stores`
- [x] `GET /api/partners`
- [x] `GET /api/batches`
- [x] `POST /api/batches`
- [x] `GET /api/batches/:batchCode`
- [x] `POST /api/batches/:batchCode/certificates`
- [x] `DELETE /api/batches/:batchCode/certificates/:certificateId`
- [x] `GET /api/transports`
- [x] `POST /api/batches/:batchCode/assign-transport`
- [x] `GET /api/transports/:transportId/checkpoints`
- [x] `POST /api/transports/:transportId/checkpoints`
- [x] `GET /api/store/deliveries`
- [x] `POST /api/store/deliveries/:batchCode/confirm`
- [x] `POST /api/store/deliveries/:batchCode/issues`
- [x] `GET /api/store/issues`
- [x] `GET /api/qr/:qrId`

### Cần chuẩn hóa tiếp

- [ ] Dời mật khẩu plain-text sang hash an toàn.
- [ ] Thêm auth token/session, middleware xác thực và phân quyền.
- [ ] Tách `src/routes/api.ts` thành modules theo domain khi file tiếp tục phình to.
- [ ] Thêm audit log model/service và chặn update/delete audit log ở tầng DB hoặc privilege.
- [ ] Chuẩn hóa response envelope theo [be/docs/API_DESIGN.md](be/docs/API_DESIGN.md), hoặc cập nhật design theo implementation nếu chọn response trực tiếp.
- [ ] Thống nhất base path: implementation đang dùng `/api`, API design đang đề xuất `/api/v1`.
- [ ] Bổ sung upload file chứng chỉ/ảnh sự cố.
- [ ] Bổ sung endpoint tạo/in/tải QR và xác thực QR bằng signature/hash.
- [ ] Thêm seed data phục vụ demo.
- [ ] Thêm test API cho use case lõi.

## 4. Admin Web

### Đã có

- [x] Vite React TypeScript app trong [fe/admin](fe/admin).
- [x] Layout chính, sidebar, dashboard và các feature screen.
- [x] Mock data tại [fe/admin/src/mocks/dashboard.json](fe/admin/src/mocks/dashboard.json).
- [x] Các màn hình nền: dashboard, accounts, partners, shipping, audit, reports.

### Cần chuẩn hóa tiếp

- [ ] Tích hợp API backend thay cho mock data theo từng module.
- [ ] Thêm auth guard và role-based navigation.
- [ ] Hoàn thiện màn hình traceability; file [fe/admin/src/features/traceability/TraceabilityScreen.tsx](fe/admin/src/features/traceability/TraceabilityScreen.tsx) hiện rỗng.
- [ ] Chuẩn hóa trạng thái loading/error/empty cho mọi màn hình.
- [ ] Đồng bộ terminology với use case: lô hàng, đối tác, vận chuyển, checkpoint, sự cố, chứng chỉ.
- [ ] Thêm test component/interaction cho nghiệp vụ quan trọng.

## 5. Mobile Web

### Đã có

- [x] Đổi thư mục chuẩn thành [fe/mobile/app](fe/mobile/app).
- [x] Vite React Tailwind mobile-first app.
- [x] Axios client dùng `VITE_API_BASE_URL` trong [fe/mobile/app/src/api.ts](fe/mobile/app/src/api.ts).
- [x] Route public: landing, login, scanner, trace.
- [x] Route theo vai trò: farm, transporter, store, inspector.
- [x] Vite proxy `/api` tới backend local.
- [x] `basicSsl` để hỗ trợ camera/QR tốt hơn khi chạy local.

### Cần chuẩn hóa tiếp

- [ ] Rà soát và sửa encoding tiếng Việt trong source mobile.
- [ ] Chuẩn hóa auth/session với backend.
- [ ] Rà soát fallback mock data khi API lỗi để tránh che lỗi thật ở môi trường staging.
- [ ] Hoàn thiện trace public theo UC30-UC31.
- [ ] Hoàn thiện tạo/tải/in QR theo UC33-UC35.
- [ ] Kiểm tra trải nghiệm camera/QR trên thiết bị thật.

## 6. Database

### Đã có

- [x] Enum role/status chính: account, partner, batch, certificate, transport, incident, QR.
- [x] Model chính: `Account`, `PartnerProfile`, `Batch`, `Certificate`, `BatchCert`, `Transport`, `TransportCheckpoint`, `Incident`, `QrCode`, `QrScanLog`.
- [x] Index cơ bản cho khóa ngoại và truy vấn vận hành.

### Cần chuẩn hóa tiếp

- [ ] Bổ sung bảng audit log append-only.
- [ ] Bổ sung constraint/index phục vụ QR lookup, scan log, batch code và timestamp theo tải mục tiêu.
- [ ] Chốt chính sách soft-delete/lock cho partner, account, batch, certificate.
- [ ] Bổ sung migration seed/demo.
- [ ] Rà soát mapping trạng thái giữa docs, Prisma enum, API và UI.

## 7. Tài liệu

### Đã có

- [x] Tổng danh sách UC01-UC45 trong [docs/usecases/UC_All_Use_Cases.md](docs/usecases/UC_All_Use_Cases.md).
- [x] Chi tiết account/auth trong [docs/usecases/UC_Account_Management.md](docs/usecases/UC_Account_Management.md).
- [x] Chi tiết lô hàng và lịch sử chuỗi cung ứng trong [docs/usecases/UC_Shipment_And_History.md](docs/usecases/UC_Shipment_And_History.md).
- [x] Chi tiết vận chuyển và audit trong [docs/usecases/UC_Shipping_And_Audit.md](docs/usecases/UC_Shipping_And_Audit.md).
- [x] Chi tiết chứng chỉ/báo cáo trong [docs/usecases/UC_Certificate_And_Reporting.md](docs/usecases/UC_Certificate_And_Reporting.md).
- [x] Chi tiết QR/đối tác trong [docs/usecases/UC_QR_And_Partner_Management.md](docs/usecases/UC_QR_And_Partner_Management.md).
- [x] API design trong [be/docs/API_DESIGN.md](be/docs/API_DESIGN.md).

### Cần chuẩn hóa tiếp

- [ ] Rà soát file docs lớn để bỏ ảnh/link hỏng dạng `![][image...]` nếu không có reference ảnh.
- [ ] Thống nhất mã UC partner/QR/report nếu tài liệu cũ và API design còn lệch số.
- [ ] Bổ sung ERD/sequence/activity diagram dạng file nguồn có thể sửa.
- [ ] Bổ sung checklist test case theo UC.

## 8. Lệnh thường dùng

```bash
npm run install:all
npm run prisma:generate
npm run prisma:migrate
npm run dev:be
npm run dev:admin
npm run dev:mobile
npm run build
```

## 9. Câu hỏi còn mở

- Dự án muốn giữ base API là `/api` hay chuyển sang `/api/v1` theo API design?
- Backend sẽ dùng JWT, session cookie, hay cơ chế đơn giản theo yêu cầu môn học?
- Audit log cần enforce ở database bằng trigger/privilege hay chỉ ở service layer trong giai đoạn demo?
