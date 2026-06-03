<p align="center"><img width="454" height="126" alt="image" src="https://github.com/user-attachments/assets/2036c003-62d1-42f1-9817-6cca86de0fc8" /> </p>

## GIỚI THIỆU ĐỒ ÁN

* **Đề tài:** Hệ thống quản lý chuỗi cung ứng thực phẩm sạch
* **Repository:** [IS208 - Quản lý dự án CNTT](https://github.com/Yuu2006/IS208-Quan-ly-du-an-CNTT)
* **Mô tả:** Backend API dùng Node.js, Express, Prisma và PostgreSQL cho hệ thống BlueFood.

## CÔNG NGHỆ VÀ CÔNG CỤ SỬ DỤNG

* Node.js
* Express
* Prisma
* PostgreSQL
* TypeScript

## THÀNH VIÊN NHÓM

| STT | MSSV | Họ và Tên | GitHub | Email |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 24521817 | Đoàn Thị Thuỳ Trang | https://github.com/ThorBietBay001 | 24521817@gm.uit.edu.vn |
| 2 | 24521769 | Lê Thị Thanh Tiền | https://github.com/tienlttt | 24521769@gm.uit.edu.vn |
| 3 | 24521776 | Nguyễn Trần Thủy Tiên | https://github.com/NgKthy | 24521776@gm.uit.edu.vn |
| 4 | 24520971 | Trần Thị Phương Linh | https://github.com/PhuongLinh2finh3 | 24520971@gm.uit.edu.vn |
| 5 | 24522039 | Nguyễn Tuấn Vũ | https://github.com/Yuu2006 | 24522039@gm.uit.edu.vn |

# BlueFood Backend

Backend API dùng Node.js, Express, Prisma và PostgreSQL. Đây là lớp dữ liệu/chức năng cho admin web và mobile web.

## Cấu trúc

```text
.
├─ docs/API_DESIGN.md
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
└─ src/
   ├─ app.ts
   ├─ server.ts
   ├─ lib/prisma.ts
   ├─ routes/api.ts
   └─ utils/json.ts
```

`src/generated/prisma` là Prisma client sinh tự động. Chạy `npm run prisma:generate` để tạo lại khi cần.

## Cài đặt

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

API mặc định:

```text
http://localhost:4000
```

Health check:

```text
GET http://localhost:4000/api/health
```

## Biến môi trường

- `DIRECT_URL`: kết nối direct/session cho Prisma migration.
- `DATABASE_URL`: kết nối runtime, có thể dùng pooler.
- `PORT`: port API, mặc định `4000`.
- `CORS_ORIGIN`: danh sách frontend origin, phân tách bằng dấu phẩy.

Dự án dùng trực tiếp `.env` ở local. Không commit `.env` hoặc file `env` chứa credential thật.

## Scripts

```bash
npm run dev              # chạy server bằng tsx watch
npm run start            # chạy server một lần
npm run typecheck        # kiểm tra TypeScript
npm run prisma:generate  # sinh Prisma client
npm run prisma:migrate   # chạy migration dev
npm run prisma:studio    # mở Prisma Studio
```

## Endpoint hiện có

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

Thiết kế đầy đủ theo use case nằm tại [docs/API_DESIGN.md](docs/API_DESIGN.md).
