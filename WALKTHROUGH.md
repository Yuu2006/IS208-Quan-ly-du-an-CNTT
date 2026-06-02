# HƯỚNG DẪN DỰ ÁN & TIẾN ĐỘ THỰC THI (WALKTHROUGH)

> 🛑 **QUY ĐỊNH LÀM VIỆC DÀNH CHO TEAM DEV (BẮT BUỘC ĐỌC):**
> Để đảm bảo tài liệu luôn đồng bộ với code thực tế, mỗi khi hoàn thành một chức năng, bạn **PHẢI THỰC HIỆN 2 BƯỚC SAU** trong cùng một Commit/Pull Request:
> 1. Đổi dấu `[ ]` thành `[x]` tại task tương ứng trong file `walkthrough.md` này.
> 2. Mở file `README.md` ra và xem xét cập nhật thêm (Ví dụ: Thêm đường dẫn API mới, cập nhật trạng thái "Đã xong" cho module, thêm thư viện mới vào Tech Stack, hoặc hướng dẫn chạy script mới).

---

# Phase 1 - Khởi động & Nền tảng Kiến trúc (Sprint 0)
- [x] Khởi tạo dự án Frontend (React.js / Next.js / Vite)
- [x] Khởi tạo dự án Backend (Node.js / Express.js)
- [ ] Thiết kế Database schema (PostgreSQL) và quan hệ giữa các bảng.
- [ ] Dựng khung Layout Dashboard Admin & Cấu hình Routing.

# Phase 2 - Nền tảng cốt lõi, Phân quyền & Audit Log (Increment 1)
## Account & Partner Management
- [ ] Module 1: Auth & Tài khoản (UC01-07)
- [ ] API: Đăng nhập (JWT), Đăng xuất, Phân quyền Role-based (Admin, Nông trại, Vận chuyển...).
- [ ] Xây dựng UI/UX Màn hình Đăng nhập & Bảng quản lý tài khoản.
- [ ] API & UI: Quản lý hồ sơ đối tác và luồng duyệt yêu cầu (UC36-40).

## Immutable Audit Log System (Cốt lõi dự án)
- [ ] Module 2: Audit Log Append-only (UC26-28)
- [ ] Database Trigger / Log Service: Tự động ghi log mọi thao tác POST/PUT/DELETE.
- [ ] Xây dựng giao diện tra cứu Log (Chỉ xem, tuyệt đối ẩn/không code nút Xóa, Sửa).

# Phase 3 - Quản lý Lô hàng & Chứng chỉ (Increment 2)
## Shipment Management
- [ ] Module 3: Quản lý Lô hàng (UC08-13)
- [ ] API: Tạo mới (sinh ID duy nhất), Cập nhật sai sót, Hủy lô hàng.
- [ ] Logic Backend/Frontend: Tự động khóa nút "Sửa/Xóa lô hàng" khi trạng thái chuyển sang "Đã xuất kho".
- [ ] Xây dựng UI Form nhập liệu (ưu tiên giao diện Mobile/Tablet cho nông trại).

## Certificate Management
- [ ] Module 4: Quản lý Chứng chỉ (UC14-18)
- [ ] Cấu hình Local Server Storage / Cloud để upload file PDF/Ảnh chứng chỉ (VietGAP, GlobalGAP).
- [ ] Xây dựng UI: Upload file, hiển thị danh sách và tải về chứng chỉ.

# Phase 4 - Vận chuyển, Nhận hàng & Đồng bộ Offline (Increment 3)
## Logistics & Offline Sync
- [ ] Module 5: Điều phối Vận chuyển (UC19-23)
- [ ] API: Tạo đơn vận chuyển, gán tài xế, tài xế check-in GPS/Nhiệt độ tại các trạm.
- [ ] Xây dựng UI: Nút check-in cho Tài xế, Xác nhận nhận hàng/Báo cáo lỗi cho Cửa hàng (UC24, UC25).
- [ ] Frontend: Tích hợp Service Worker / IndexedDB để lưu Cache dữ liệu khi mất mạng (chế độ Offline).
- [ ] Backend API: Bulk-insert để nhận và đồng bộ cục dữ liệu lớn khi thiết bị có Internet trở lại.

# Phase 5 - QR Code, Truy xuất & Báo cáo (Increment 4)
## QR Code & Public Traceability
- [ ] Module 6: QR Code & Truy xuất (UC29-35)
- [ ] Tích hợp thuật toán sinh mã QR chứa chữ ký xác thực & URL `.../trace/{batch_id}`.
- [ ] Tích hợp thư viện Web Camera (HTML5) cho chức năng quét mã trực tiếp trên trình duyệt.
- [ ] Xây dựng UI: Dòng thời gian (Timeline) hiển thị hành trình nguồn gốc cực mượt cho Khách hàng.
- [ ] Backend: Tích hợp Redis Cache để tối ưu API quét QR, đảm bảo phản hồi < 2 giây.

## Reporting Dashboard
- [ ] Module 7: Thống kê & Báo cáo (UC41-45)
- [ ] API & UI: Widget cảnh báo lô hàng sắp hết hạn (cảnh báo đỏ/cam).
- [ ] Biểu đồ thống kê (UI Support - Chart.js / Recharts): Tồn kho, Số lượt quét QR.
- [ ] Tích hợp thư viện xuất báo cáo ra file Excel / PDF.

# Phase 6 - Final Optimization & Release
- [ ] Refactor code, dọn dẹp các file Mock Data (như `dashboard.json`).
- [ ] Kiểm thử Bảo mật: Test thử các script cố tình thay đổi Audit Log xem Database có chặn lại không.
- [ ] Stress test API truy xuất mã QR giả lập chịu tải 100.000 lượt quét.
- [ ] Đóng gói Docker Compose cho Deployment thực tế (Staging / Production).
- [ ] Chốt đồ án! 🏁