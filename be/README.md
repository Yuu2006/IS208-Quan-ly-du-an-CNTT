# BlueFood Backend

Backend API dùng Node.js, Express, Prisma và PostgreSQL. Đây là lớp dữ liệu/chức năng cho admin web và mobile web.

## Cấu trúc

```text
be/
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

Dự án dùng trực tiếp [`.env`](.env) ở local. Không commit `.env` hoặc file `env` chứa credential thật.

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
