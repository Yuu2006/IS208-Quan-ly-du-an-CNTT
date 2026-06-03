# BlueFood Mobile Web

Mobile web là ứng dụng Vite/React/Tailwind theo hướng mobile-first cho các luồng quét QR, truy xuất nguồn gốc và thao tác theo vai trò vận hành.

## Vai trò và luồng chính

- Khách hàng/inspector: quét QR, xem nguồn gốc, chứng chỉ và lịch sử chuỗi cung ứng.
- Nông trại: quản lý lô hàng, chứng chỉ, QR và yêu cầu vận chuyển.
- Đơn vị vận chuyển: xem chuyến, cập nhật checkpoint, nhiệt độ, trạng thái.
- Cửa hàng: xác nhận nhận hàng và báo cáo sự cố.

## Cấu trúc

```text
fe/mobile/app/
├─ src/
│  ├─ pages/
│  ├─ roles/
│  │  ├─ farm/
│  │  ├─ inspector/
│  │  ├─ store/
│  │  └─ transporter/
│  ├─ shared/
│  ├─ api.ts
│  ├─ auth.tsx
│  ├─ data.ts
│  └─ App.tsx
├─ tailwind.config.js
├─ vite.config.ts
└─ package.json
```

## Cài đặt và chạy

```bash
npm install
npm run dev
```

URL mặc định: `https://localhost:5173`.

Build:

```bash
npm run build
```

## API

Ứng dụng dùng `VITE_API_BASE_URL` trong [src/api.ts](src/api.ts). File `.env` local nên dùng `/api` để đi qua Vite proxy tới backend `http://localhost:4000`.

Nếu chạy không qua proxy, đặt:

```text
VITE_API_BASE_URL="http://localhost:4000/api"
```

## Ghi chú kỹ thuật

- `vite.config.ts` hiện bật `basicSsl`, phù hợp thử camera/QR trên trình duyệt.
- Một số chuỗi tiếng Việt trong source có dấu hiệu sai encoding và cần được rà soát ở task riêng.
- Khi thêm/sửa API contract, cập nhật [../../../../be/docs/API_DESIGN.md](../../../../be/docs/API_DESIGN.md) và [../../../../WALKTHROUGH.md](../../../../WALKTHROUGH.md).
