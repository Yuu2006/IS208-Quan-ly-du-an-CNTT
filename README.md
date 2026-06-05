<p align="center"><img width="454" height="126" alt="BlueFood" src="https://github.com/user-attachments/assets/2036c003-62d1-42f1-9817-6cca86de0fc8" /> </p>

## GIỚI THIỆU ĐỒ ÁN

* **Đề tài:** Hệ thống quản lý chuỗi cung ứng thực phẩm sạch
* **Repository:** [IS208 - Quản lý dự án CNTT](https://github.com/Yuu2006/IS208-Quan-ly-du-an-CNTT)
* **Mô tả:** BlueFood gồm Backend API, Admin Web và Mobile Web phục vụ quản lý lô hàng, đối tác, vận chuyển, truy xuất nguồn gốc, QR, audit log và các luồng thao tác theo vai trò.

## CÔNG NGHỆ VÀ CÔNG CỤ SỬ DỤNG

* **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
* **Admin Web:** React, TypeScript, Vite, Tailwind CSS
* **Mobile Web:** React, TypeScript, Vite, Tailwind CSS
* **Công cụ:** npm, Prisma CLI, Git

## THÀNH VIÊN NHÓM

| STT | MSSV | Họ và Tên | GitHub | Email |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 24521817 | Đoàn Thị Thuỳ Trang | https://github.com/ThorBietBay001 | 24521817@gm.uit.edu.vn |
| 2 | 24521769 | Lê Thị Thanh Tiền | https://github.com/tienlttt | 24521769@gm.uit.edu.vn |
| 3 | 24521776 | Nguyễn Trần Thủy Tiên | https://github.com/NgKthy | 24521776@gm.uit.edu.vn |
| 4 | 24520971 | Trần Thị Phương Linh | https://github.com/PhuongLinh2finh3 | 24520971@gm.uit.edu.vn |
| 5 | 24522039 | Nguyễn Tuấn Vũ | https://github.com/Yuu2006 | 24522039@gm.uit.edu.vn |

## CẤU TRÚC DỰ ÁN

```text
.
├─ backend/             # Express API, Prisma schema, migrations
├─ frontend/
│  ├─ admin/            # Web quản trị
│  └─ mobile/           # Mobile web cho các vai trò vận hành và truy xuất QR
├─ README.md
└─ repository_link.txt
```

## YÊU CẦU TRƯỚC KHI CÀI ĐẶT

Cài sẵn các công cụ sau:

* **Git**
* **Node.js 20+** hoặc mới hơn, khuyến nghị dùng bản LTS
* **npm** đi kèm Node.js
* **PostgreSQL** local hoặc một database PostgreSQL cloud

Kiểm tra phiên bản:

```bash
node -v
npm -v
git --version
```

## CLONE DỰ ÁN

```bash
git clone https://github.com/Yuu2006/IS208-Quan-ly-du-an-CNTT.git
cd IS208-Quan-ly-du-an-CNTT
```

Nếu đã có source code trên máy, mở terminal tại thư mục gốc của dự án, tức thư mục đang chứa `backend` và `frontend`.

## CẤU HÌNH DATABASE CHO BACKEND

Tạo database PostgreSQL trước, ví dụ:

```sql
CREATE DATABASE bluefood;
```

Tạo file `.env` trong thư mục `backend`:

```bash
cd backend
```

Nội dung mẫu cho `backend/.env`:

```env
DIRECT_URL="postgresql://postgres:your_password@localhost:5432/bluefood"
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/bluefood"
PORT=4000
CORS_ORIGIN="https://localhost:5173,https://localhost:5174,http://localhost:5173,http://localhost:5174"
```

Ý nghĩa biến môi trường:

* `DIRECT_URL`: chuỗi kết nối PostgreSQL dùng cho Prisma migration.
* `DATABASE_URL`: chuỗi kết nối PostgreSQL dùng khi backend chạy.
* `PORT`: cổng backend, mặc định là `4000`.
* `CORS_ORIGIN`: danh sách domain frontend được phép gọi API, phân tách bằng dấu phẩy.

Không commit file `.env` hoặc credential thật lên repository.

## CÀI ĐẶT VÀ CHẠY BACKEND

Chạy trong thư mục `backend`:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:4000
```

Kiểm tra API:

```text
GET http://localhost:4000/api/health
```

Các script backend:

```bash
npm run dev              # chạy server bằng tsx watch
npm run start            # chạy server một lần
npm run typecheck        # kiểm tra TypeScript
npm run prisma:generate  # sinh Prisma client
npm run prisma:migrate   # chạy migration dev
npm run prisma:studio    # mở Prisma Studio
```

## CÀI ĐẶT VÀ CHẠY ADMIN WEB

Mở terminal mới, chạy:

```bash
cd frontend/admin
npm install
npm run dev
```

Admin Web mặc định chạy tại:

```text
https://localhost:5174
```

`frontend/admin/vite.config.ts` đã cấu hình proxy `/api` về backend `http://localhost:4000`, nên có thể để frontend gọi API bằng `/api`.

Nếu muốn cấu hình rõ ràng, tạo file `frontend/admin/.env`:

```env
VITE_API_BASE_URL="/api"
```

Hoặc nếu không dùng proxy Vite:

```env
VITE_API_BASE_URL="http://localhost:4000/api"
```

Các script Admin Web:

```bash
npm run dev      # chạy môi trường phát triển
npm run build    # build production
npm run lint     # kiểm tra ESLint
npm run preview  # xem thử bản build
```

## CÀI ĐẶT VÀ CHẠY MOBILE WEB

Mở terminal mới, chạy:

```bash
cd frontend/mobile
npm install
npm run dev
```

Mobile Web mặc định chạy tại:

```text
https://localhost:5173
```

`frontend/mobile/vite.config.ts` đã cấu hình proxy `/api` về backend `http://localhost:4000`, nên có thể để frontend gọi API bằng `/api`.

Nếu muốn cấu hình rõ ràng, tạo file `frontend/mobile/.env`:

```env
VITE_API_BASE_URL="/api"
```

Hoặc nếu không dùng proxy Vite:

```env
VITE_API_BASE_URL="http://localhost:4000/api"
```

Các script Mobile Web:

```bash
npm run dev      # chạy môi trường phát triển
npm run build    # build production
npm run preview  # xem thử bản build
```

## THỨ TỰ CHẠY TOÀN BỘ ỨNG DỤNG

Nên chạy ứng dụng bằng 3 terminal riêng:

**Terminal 1 - Backend**

```bash
cd backend
npm run dev
```

**Terminal 2 - Admin Web**

```bash
cd frontend/admin
npm run dev
```

**Terminal 3 - Mobile Web**

```bash
cd frontend/mobile
npm run dev
```

Sau khi chạy xong:

* Backend API: `http://localhost:4000`
* Admin Web: `https://localhost:5174`
* Mobile Web: `https://localhost:5173`

Vì frontend đang bật `@vitejs/plugin-basic-ssl`, trình duyệt có thể hỏi xác nhận certificate local. Chọn tiếp tục truy cập để mở app trong môi trường phát triển.

## KIỂM TRA VÀ BUILD

Backend:

```bash
cd backend
npm run typecheck
```

Admin Web:

```bash
cd frontend/admin
npm run lint
npm run build
```

Mobile Web:

```bash
cd frontend/mobile
npm run build
```

## LỖI THƯỜNG GẶP

**Không kết nối được database**

Kiểm tra PostgreSQL đã chạy, database đã được tạo và `DIRECT_URL`/`DATABASE_URL` trong `backend/.env` đúng username, password, host, port, database name.

**Frontend gọi API bị lỗi CORS**

Kiểm tra backend đang chạy ở `http://localhost:4000` và `CORS_ORIGIN` có chứa URL frontend đang dùng, ví dụ `https://localhost:5173` và `https://localhost:5174`.

**Frontend không gọi được `/api`**

Kiểm tra backend đã chạy. Nếu không dùng Vite proxy, đặt `VITE_API_BASE_URL="http://localhost:4000/api"` trong file `.env` của frontend tương ứng.

**Prisma báo thiếu client hoặc schema thay đổi**

Chạy lại:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

**Port đã được sử dụng**

Đổi `PORT` trong `backend/.env` hoặc đổi port trong `frontend/admin/vite.config.ts` và `frontend/mobile/vite.config.ts`. Nếu đổi port backend, cập nhật lại proxy Vite hoặc `VITE_API_BASE_URL`.

## TÀI LIỆU LIÊN QUAN

* [Thiết kế API](backend/docs/API_DESIGN.md)
* [Prisma schema](backend/prisma/schema.prisma)
* [Admin Web README](frontend/admin/README.md)
* [Mobile Web README](frontend/mobile/README.md)
