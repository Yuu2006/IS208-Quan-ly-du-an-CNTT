# BlueFood

BlueFood là hệ thống quản lý chuỗi cung ứng thực phẩm sạch, tập trung vào truy xuất nguồn gốc lô hàng, chứng chỉ chất lượng, vận chuyển, mã QR và nhật ký audit bất biến.

Tài liệu nghiệp vụ nằm trong `docs/usecases`. Các ràng buộc trong thư mục này là nguồn tham chiếu chính khi thiết kế API, database, UI và test case.

## Cấu Trúc Thư Mục

```text
bluefood/
|-- be/                         Backend API Express + Prisma
|   |-- docs/API_DESIGN.md       Thiết kế API theo use case và schema
|   |-- prisma/                  Prisma schema và migrations
|   `-- src/                     App, server, routes, Prisma client wrapper
|-- docs/
|   |-- usecases/                UC01-UC45 và ràng buộc nghiệp vụ
|   `-- WALKTHROUGH.md           Checklist triển khai chi tiết
|-- fe/
|   |-- admin/                   Admin dashboard web app
|   `-- mobile/app/              Mobile-first web app cho QR và vai trò vận hành
|-- package.json                 Script điều phối toàn monorepo
|-- README.md                    Tổng quan, cài đặt, cách chạy
`-- WALKTHROUGH.md               Ma trận tiến độ kỹ thuật hiện tại
```

## Branch Hiện Tại

Repo đang được sắp xếp theo hướng monorepo trong branch `fe/admin`, với ba module chính:

- `be/`: backend.
- `fe/admin/`: admin web.
- `fe/mobile/app/`: mobile web.

Remote hiện tại có các branch:

- `origin/backend`: backend branch trên GitHub. Local hiện cũng đang là `backend`; nếu muốn đổi tên thành `be` thì cần đổi branch local và/hoặc remote trong một bước riêng.
- `origin/fe/admin`: branch đang chứa cấu trúc monorepo sạch nhất.
- `origin/fe/mobile`: branch mobile cũ, app mobile đang nằm ở root của branch này.
- `origin/main`: README/thông tin tổng quan cũ.

Lưu ý: Git branch không gắn riêng cho từng thư mục trong cùng một working tree. Khi `git switch` sang branch khác, toàn bộ workspace sẽ đổi theo branch đó. Nếu muốn mỗi branch nằm trong một thư mục riêng và không ghi đè lẫn nhau, nên dùng `git worktree`.

## Phạm Vi Hiện Tại

- Backend API: Node.js, Express, Prisma, PostgreSQL.
- Admin web: React, TypeScript, Vite; hiện dùng mock data cho dashboard/admin.
- Mobile web: React, TypeScript, Vite, Tailwind; phục vụ quét QR, truy xuất, thao tác theo vai trò farm/transporter/store/inspector.
- Database: PostgreSQL với Prisma schema cho tài khoản, đối tác, lô hàng, chứng chỉ, vận chuyển, checkpoint, sự cố, QR và log quét QR.

## Ràng Buộc Nghiệp Vụ Bắt Buộc

- Audit log là append-only: không cung cấp thao tác sửa/xóa log qua ứng dụng.
- Mọi thay đổi trạng thái hoặc dữ liệu nghiệp vụ quan trọng phải ghi audit log.
- Mỗi lô hàng có mã định danh duy nhất và có QR truy xuất.
- Khách hàng có thể quét QR/truy xuất mà không cần đăng nhập.
- QR phải hợp lệ, đang active, và phản hồi truy xuất mục tiêu dưới 2 giây.
- Không xóa vật lý dữ liệu có lịch sử chuỗi cung ứng; dùng trạng thái hủy/khóa/vô hiệu hóa.
- Phân quyền theo vai trò: `ADMIN`, `FARMER`, `TRANSPORTER`, `WAREHOUSE`, `STORE`, `INSPECTOR`.
- Tài liệu trong `docs/usecases` là chuẩn nghiệp vụ; nếu code thay đổi luồng, cập nhật tài liệu tương ứng.

## Cài Đặt Môi Trường

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

Không commit `.env`, `env`, private key, token hoặc chuỗi kết nối thật. Các file `.env` đã được ignore.

## Chạy Local

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

## Kiểm Tra Nhanh

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

## API Hiện Có

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

Thiết kế API đầy đủ hơn nằm ở `be/docs/API_DESIGN.md`. Lưu ý: file thiết kế dùng base path dự kiến `/api/v1`, còn implementation hiện tại đang dùng `/api`.

## Tài Liệu Quan Trọng

- `WALKTHROUGH.md`: tiến độ kỹ thuật, cấu trúc, việc còn thiếu.
- `docs/WALKTHROUGH.md`: checklist triển khai chi tiết theo giai đoạn.
- `docs/usecases/UC_All_Use_Cases.md`: danh sách UC01-UC45.
- `be/docs/API_DESIGN.md`: API design theo use case.
- `Wireframe ADMIN BlueFood.pdf`: wireframe admin.

## Quy Ước Cập Nhật Tài Liệu

- Thay đổi API: cập nhật `be/docs/API_DESIGN.md` và README liên quan.
- Thay đổi nghiệp vụ: cập nhật file use case tương ứng trong `docs/usecases`.
- Hoàn thành task: tick trong `WALKTHROUGH.md` hoặc walkthrough chi tiết trong `docs`.
- Thay đổi cấu trúc/môi trường: cập nhật README root và file `.env` local tương ứng.
