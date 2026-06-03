# BlueFood Admin Web

Admin web là dashboard quản trị cho BlueFood, xây bằng React, TypeScript và Vite.

## Hiện trạng

- UI đã có các màn hình dashboard, tài khoản, đối tác, vận chuyển, audit log và báo cáo.
- Dữ liệu hiện lấy từ [src/mocks/dashboard.json](src/mocks/dashboard.json).
- Chưa tích hợp trực tiếp backend API trong source admin hiện tại.

## Cấu trúc

```text
fe/admin/
├─ public/
├─ src/
│  ├─ components/
│  ├─ features/
│  │  ├─ accounts/
│  │  ├─ audit/
│  │  ├─ dashboard/
│  │  ├─ partners/
│  │  ├─ reports/
│  │  └─ shipping/
│  ├─ mocks/
│  ├─ App.tsx
│  └─ main.tsx
└─ package.json
```

## Cài đặt và chạy

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Biến môi trường

`VITE_API_BASE_URL` được chuẩn bị cho giai đoạn tích hợp API. Khi tích hợp, ưu tiên gọi backend qua `http://localhost:4000/api` hoặc proxy Vite tương ứng.

Dự án dùng trực tiếp `.env` local và không commit file này.

## Tài liệu liên quan

- Root README: [../../README.md](../../README.md)
- Walkthrough: [../../WALKTHROUGH.md](../../WALKTHROUGH.md)
- Use cases: [../../docs/usecases](../../docs/usecases)
- API design: [../../be/docs/API_DESIGN.md](../../be/docs/API_DESIGN.md)
