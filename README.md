# BlueFood

BlueFood là hệ thống quản lý chuỗi cung ứng thực phẩm sạch, tập trung vào truy xuất nguồn gốc lô hàng, chứng chỉ chất lượng, vận chuyển, mã QR và nhật ký audit bất biến.

Tài liệu nghiệp vụ nằm trong [docs/usecases](docs/usecases). Các ràng buộc trong thư mục này là nguồn tham chiếu chính khi thiết kế API, database, UI và test case.

## Phạm vi hiện tại

- Backend API: Node.js, Express, Prisma, PostgreSQL.
- Admin web: React, TypeScript, Vite; hiện dùng mock data cho dashboard/admin.
- Mobile web: React, TypeScript, Vite, Tailwind; phục vụ quét QR, truy xuất, thao tác theo vai trò farm/transporter/store/inspector.
- Database: PostgreSQL với Prisma schema cho tài khoản, đối tác, lô hàng, chứng chỉ, vận chuyển, checkpoint, sự cố, QR và log quét QR.

## Cấu trúc thư mục

```text
bluefood/
├─ be/                         Backend API Express + Prisma
│  ├─ docs/API_DESIGN.md        Thiết kế API theo use case và schema
│  ├─ prisma/                   Prisma schema và migrations
│  └─ src/                      App, server, routes, Prisma client wrapper
├─ docs/
│  ├─ usecases/                 UC01-UC45 và ràng buộc nghiệp vụ
│  └─ WALKTHROUGH_*.md          Checklist tiến độ chi tiết
├─ fe/
│  ├─ admin/                    Admin dashboard web app
│  └─ mobile/app/               Mobile-first web app cho QR và vai trò vận hành
├─ README.md                    Tổng quan, cài đặt, cách chạy
└─ WALKTHROUGH.md               Ma trận tiến độ kỹ thuật hiện tại
```

## Ràng buộc nghiệp vụ bắt buộc

- Audit log là append-only: không cung cấp thao tác sửa/xóa log qua ứng dụng.
- Mọi thay đổi trạng thái hoặc dữ liệu nghiệp vụ quan trọng phải ghi audit log.
- Mỗi lô hàng có mã định danh duy nhất và có QR truy xuất.
- Khách hàng có thể quét QR/truy xuất mà không cần đăng nhập.
- QR phải hợp lệ, đang active, và phản hồi truy xuất mục tiêu dưới 2 giây.
- Không xóa vật lý dữ liệu có lịch sử chuỗi cung ứng; dùng trạng thái hủy/khóa/vô hiệu hóa.
- Phân quyền theo vai trò: `ADMIN`, `FARMER`, `TRANSPORTER`, `WAREHOUSE`, `STORE`, `INSPECTOR`.
- Tài liệu trong `docs/usecases` là chuẩn nghiệp vụ; nếu code thay đổi luồng, cập nhật tài liệu tương ứng.

## Cài đặt môi trường

Yêu cầu khuyến nghị:

- Node.js 20+
- npm 10+
- PostgreSQL hoặc Supabase PostgreSQL

Cài dependencies cho toàn bộ repo:

```bash
npm run install:all
```

Dự án dùng trực tiếp file `.env` thật tại từng module:

```text
be/.env
fe/admin/.env
fe/mobile/app/.env
```

Lưu ý bảo mật: không commit `.env`, `env`, private key, token hoặc chuỗi kết nối thật. Các file `.env` đã được ignore.

## Chạy local

Backend:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run dev:be
```

Admin web:

```bash
npm run dev:admin
```

Mobile web:

```bash
npm run dev:mobile
```

URL mặc định:

- Backend API: `http://localhost:4000`
- Admin web: Vite sẽ in URL khi chạy, thường là `http://localhost:5173`
- Mobile web: Vite sẽ in URL khi chạy, theo cấu hình hiện tại thường là `https://localhost:5173`

## Kiểm tra nhanh

```bash
npm run build
```

Lệnh này chạy typecheck backend, build admin và build mobile.

Các lệnh riêng:

```bash
npm run build:be
npm run build:admin
npm run build:mobile
```

## API hiện có

Backend hiện mount route dưới `/api`.

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register-customer`
- `GET /api/accounts`
- `GET /api/transporters`
- `GET /api/stores`
- `GET /api/partners`
- `GET /api/batches`
- `POST /api/batches`
- `GET /api/batches/:batchCode`
- `POST /api/batches/:batchCode/certificates`
- `DELETE /api/batches/:batchCode/certificates/:certificateId`
- `GET /api/transports`
- `POST /api/batches/:batchCode/assign-transport`
- `GET /api/transports/:transportId/checkpoints`
- `POST /api/transports/:transportId/checkpoints`
- `GET /api/store/deliveries`
- `POST /api/store/deliveries/:batchCode/confirm`
- `POST /api/store/deliveries/:batchCode/issues`
- `GET /api/store/issues`
- `GET /api/qr/:qrId`

Thiết kế API đầy đủ hơn nằm ở [be/docs/API_DESIGN.md](be/docs/API_DESIGN.md). Lưu ý: file thiết kế dùng base path dự kiến `/api/v1`, còn implementation hiện tại đang dùng `/api`.

## Tài liệu quan trọng

- [WALKTHROUGH.md](WALKTHROUGH.md): tiến độ kỹ thuật, cấu trúc, việc còn thiếu.
- [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md): checklist triển khai chi tiết theo giai đoạn.
- [docs/usecases/UC_All_Use_Cases.md](docs/usecases/UC_All_Use_Cases.md): danh sách UC01-UC45.
- [be/docs/API_DESIGN.md](be/docs/API_DESIGN.md): API design theo use case.
- [Wireframe ADMIN BlueFood.pdf](<Wireframe ADMIN BlueFood.pdf>): wireframe admin.

## Quy ước cập nhật tài liệu

- Thay đổi API: cập nhật `be/docs/API_DESIGN.md` và README liên quan.
- Thay đổi nghiệp vụ: cập nhật file use case tương ứng trong `docs/usecases`.
- Hoàn thành task: tick trong `WALKTHROUGH.md` hoặc walkthrough chi tiết trong `docs`.
- Thay đổi cấu trúc/môi trường: cập nhật README root và file `.env` local tương ứng.
