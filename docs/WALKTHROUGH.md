# HƯỚNG DẪN DỰ ÁN & TIẾN ĐỘ THỰC THI (WALKTHROUGH)
## Dự án ITPJ2604 - Hệ thống quản lý chuỗi cung ứng thực phẩm sạch BlueFood

> **Mục tiêu của file này:** theo dõi tiến độ thực thi dự án, đối chiếu giữa Use Case - API - UI - Database - Test Case - Tài liệu bàn giao.  
> Mỗi task sau khi hoàn thành phải được tick `[x]` và cập nhật README/API document nếu có thay đổi liên quan.

---

## 0. Quy định làm việc bắt buộc cho team dev

- [ ] Mỗi Pull Request phải gắn với ít nhất một task trong `WALKTHROUGH.md`.
- [ ] Khi hoàn thành chức năng, đổi dấu `[ ]` thành `[x]` tại task tương ứng.
- [ ] Cập nhật `README.md` nếu có thay đổi về cách chạy dự án, biến môi trường, thư viện, API hoặc cấu trúc thư mục.
- [ ] Cập nhật tài liệu API nếu có thêm/sửa/xóa endpoint.
- [ ] Cập nhật migration/schema nếu có thay đổi database.
- [ ] Mọi thay đổi dữ liệu nghiệp vụ quan trọng phải được ghi vào audit log.
- [ ] Không hard-code tài khoản, mật khẩu, token, secret key hoặc thông tin kết nối database trong source code.
- [ ] Không commit file `.env`, file backup thật, private key hoặc dữ liệu nhạy cảm lên Git.
- [ ] Trước khi merge vào nhánh chính, phải kiểm tra build, lint, test cơ bản và chạy thử luồng nghiệp vụ liên quan.

---

## 1. Thông tin phạm vi dự án

- **Mã đồ án:** ITPJ2604
- **Tên dự án:** Hệ thống quản lý chuỗi cung ứng thực phẩm sạch BlueFood
- **Loại hệ thống:** Web Hybrid
  - Web application cho quản trị, nông trại, vận chuyển, cửa hàng.
  - Mobile/Web scanning module cho quét QR và truy xuất nguồn gốc.
- **Phương pháp triển khai:** Incremental, kết hợp Scrum và Kanban (Scrumban).
- **Thời gian triển khai:** 5 tháng.
- **Ngân sách:** 1.2 tỷ VNĐ.
- **Đội ngũ:** 5 người.
- **Không yêu cầu blockchain thật.**
- **Yêu cầu đặc biệt:** Audit log chỉ append, không cho sửa/xóa bằng chức năng ứng dụng.

### 1.1. Tiêu chí thành công bắt buộc

- [ ] 100% lô hàng có mã QR và truy xuất được.
- [ ] Người dùng truy xuất thông tin lô hàng trong dưới 2 giây.
- [ ] Mỗi thay đổi trạng thái lô hàng đều được ghi lại trong audit log.
- [ ] Hệ thống quản lý tối thiểu 10.000 lô hàng/năm.
- [ ] Không có dữ liệu lịch sử bị chỉnh sửa hoặc xóa.
- [ ] Hệ thống đáp ứng tối thiểu 100.000 lượt quét QR/năm.
- [ ] Mỗi lô hàng có ID duy nhất.
- [ ] Người dùng có thể truy xuất lịch sử theo chuỗi cung ứng từ nông trại đến cửa hàng.

---

## 2. Ma trận đối chiếu Use Case - Module

| Nhóm nghiệp vụ | Use Case | Module triển khai | Trạng thái |
|---|---:|---|---|
| Quản lý tài khoản | UC01 - UC07 | Auth, Account, RBAC | [ ] |
| Quản lý lô hàng | UC08 - UC13 | Batch/Shipment Batch | [ ] |
| Quản lý chứng chỉ | UC14 - UC18 | Certificate | [ ] |
| Quản lý vận chuyển | UC19 - UC25 | Logistics/Transport | [ ] |
| Quản lý Audit Log | UC26 - UC28 | Immutable Audit Log | [ ] |
| Quản lý mã QR định danh | UC29 - UC31 | QR Code & Traceability | [ ] |
| Quản lý hồ sơ đối tác | UC32 - UC36 | Partner Profile | [ ] |
| Báo cáo và thống kê | UC37 - UC41 | Reporting Dashboard | [ ] |

> Lưu ý: Khi thêm task mới, phải kiểm tra task đó thuộc UC nào để tránh lệch mã Use Case.

---

# GIAI ĐOẠN 1: Sprint 0 - Khởi động, yêu cầu và nền tảng kiến trúc

## 1.1. Khởi tạo dự án và tài liệu nền

- [x] Khởi tạo dự án Frontend.
- [x] Khởi tạo dự án Backend.
- [ ] Khởi tạo repository Git và quy ước nhánh làm việc.
- [ ] Thiết lập cấu trúc thư mục chuẩn cho Frontend.
- [ ] Thiết lập cấu trúc thư mục chuẩn cho Backend.
- [ ] Tạo file `.env.example` cho Frontend và Backend.
- [ ] Viết hướng dẫn cài đặt và chạy local trong `README.md`.
- [ ] Thống nhất coding convention và quy tắc đặt tên.
- [ ] Tạo checklist Pull Request.
- [ ] Tạo danh sách thư viện chính của dự án.


## 1.3. Thiết kế nghiệp vụ và dữ liệu nền tảng

- [ ] Chuẩn hóa database.
- [ ] Mô tả chi tiết thuộc tính database.
- [ ] Thiết kế state diagram cho vòng đời lô hàng.
- [ ] Thiết kế state diagram cho đơn vận chuyển.
- [ ] Thiết kế state diagram cho hồ sơ đối tác.
- [ ] Lập cơ sở dữ liệu mẫu phục vụ demo.
- [ ] Khởi tạo database, table, index, constraint, function/procedure cần thiết.

## 1.4. Thiết kế kiến trúc kỹ thuật

- [ ] Thiết kế kiến trúc tổng thể Web Hybrid.
- [ ] Thiết kế kiến trúc Frontend.
- [ ] Thiết kế kiến trúc Backend/API.
- [ ] Thiết kế kiến trúc Database.
- [ ] Thiết kế cơ chế xác thực và phân quyền.
- [ ] Thiết kế cơ chế audit log append-only.
- [ ] Thiết kế cơ chế sinh ID duy nhất cho lô hàng.
- [ ] Thiết kế cơ chế QR trace URL.
- [ ] Thiết kế cơ chế upload và lưu trữ file chứng chỉ.
- [ ] Thiết kế cơ chế offline cache và đồng bộ dữ liệu.
- [ ] Thiết kế cơ chế backup và phục hồi.
- [ ] Thiết kế logging, monitoring cơ bản.
- [ ] Chốt kiến trúc với team và stakeholder.

---

# GIAI ĐOẠN 2: Increment 1 - Nền tảng cốt lõi, phân quyền và Audit Log

## 2.1. UI/UX nền tảng

- [ ] Thiết kế UI/UX Web quản trị.
- [ ] Thiết kế layout dashboard theo từng vai trò.
- [ ] Thiết kế màn hình đăng nhập.
- [ ] Thiết kế màn hình quản lý tài khoản.
- [ ] Thiết kế màn hình quản lý hồ sơ đối tác.
- [ ] Thiết kế màn hình audit log.
- [ ] Cắt giao diện layout chính.
- [ ] Cấu hình routing Frontend.
- [ ] Cấu hình guard route theo quyền người dùng.

## 2.2. Module Auth & Quản lý tài khoản (UC01 - UC07)

- [ ] API đăng nhập.
- [ ] API đăng xuất.
- [ ] API refresh token/session nếu có.
- [ ] Mã hóa mật khẩu bằng cơ chế an toàn.
- [ ] Kiểm tra tài khoản bị khóa khi đăng nhập.
- [ ] API thêm tài khoản.
- [ ] API cập nhật thông tin tài khoản.
- [ ] API đổi mật khẩu.
- [ ] API phân quyền người dùng.
- [ ] API khóa/mở khóa tài khoản.
- [ ] UI đăng nhập.
- [ ] UI danh sách tài khoản.
- [ ] UI thêm tài khoản.
- [ ] UI cập nhật tài khoản.
- [ ] UI phân quyền.
- [ ] UI khóa/mở khóa tài khoản.
- [ ] Ghi audit log cho đăng nhập thành công/thất bại.
- [ ] Ghi audit log cho đăng xuất.
- [ ] Ghi audit log cho thêm/sửa/khóa/phân quyền tài khoản.
- [ ] Test UC01 - Quản lý tài khoản.
- [ ] Test UC02 - Đăng nhập.
- [ ] Test UC03 - Đăng xuất.
- [ ] Test UC04 - Thêm tài khoản.
- [ ] Test UC05 - Cập nhật thông tin tài khoản.
- [ ] Test UC06 - Phân quyền người dùng.
- [ ] Test UC07 - Thay đổi trạng thái tài khoản.

## 2.3. Module hồ sơ đối tác (UC32 - UC36)

- [ ] Thiết kế bảng hồ sơ đối tác.
- [ ] API thêm hồ sơ đối tác.
- [ ] API cập nhật hồ sơ đối tác.
- [ ] API gửi yêu cầu cập nhật hồ sơ chờ duyệt.
- [ ] API phê duyệt/từ chối yêu cầu cập nhật hồ sơ.
- [ ] API tra cứu hồ sơ đối tác.
- [ ] API khóa/vô hiệu hóa hồ sơ đối tác.
- [ ] UI danh sách đối tác.
- [ ] UI thêm hồ sơ đối tác.
- [ ] UI cập nhật hồ sơ đối tác.
- [ ] UI duyệt yêu cầu cập nhật hồ sơ.
- [ ] UI tra cứu/lọc hồ sơ đối tác.
- [ ] UI khóa/vô hiệu hóa hồ sơ.
- [ ] Ghi audit log cho mọi thao tác hồ sơ đối tác.
- [ ] Test UC32 - Quản lý hồ sơ đối tác.
- [ ] Test UC33 - Thêm mới hồ sơ đối tác.
- [ ] Test UC34 - Cập nhật hồ sơ đối tác.
- [ ] Test UC35 - Tra cứu hồ sơ đối tác.
- [ ] Test UC36 - Xóa/khóa hồ sơ đối tác.

## 2.4. Module Audit Log Append-only (UC26 - UC28)

- [ ] Thiết kế bảng audit log.
- [ ] Bổ sung trường `actor_id`.
- [ ] Bổ sung trường `action`.
- [ ] Bổ sung trường `object_type`.
- [ ] Bổ sung trường `object_id`.
- [ ] Bổ sung trường `old_value`.
- [ ] Bổ sung trường `new_value`.
- [ ] Bổ sung trường `ip_address`.
- [ ] Bổ sung trường `user_agent`.
- [ ] Bổ sung trường `created_at`.
- [ ] Cài đặt log service ở Backend.
- [ ] Cài đặt database trigger nếu cần.
- [ ] Chặn UPDATE trên bảng audit log.
- [ ] Chặn DELETE trên bảng audit log.
- [ ] Phân quyền database để tài khoản ứng dụng không được sửa/xóa audit log.
- [ ] API xem tổng quan audit log.
- [ ] API xem lịch sử thay đổi theo lô hàng.
- [ ] API tra cứu audit log theo thời gian, người dùng, loại sự kiện, đối tượng.
- [ ] API phân trang kết quả audit log.
- [ ] UI tổng quan audit log.
- [ ] UI timeline lịch sử thay đổi lô hàng.
- [ ] UI tra cứu audit log.
- [ ] Ẩn hoàn toàn nút sửa/xóa audit log trên UI.
- [ ] Ghi log cả hành động tra cứu audit log quan trọng.
- [ ] Giả lập Admin cố sửa audit log bằng chức năng ứng dụng.
- [ ] Giả lập request API cố xóa audit log.
- [ ] Giả lập câu lệnh trực tiếp cố UPDATE/DELETE audit log ở database.
- [ ] Test UC26 - Quản lý Audit Log.
- [ ] Test UC27 - Xem lịch sử thay đổi lô hàng.
- [ ] Test UC28 - Tra cứu Audit Log.

## 2.5. Review Increment 1

- [ ] Kiểm thử phân quyền theo từng vai trò.
- [ ] Kiểm thử route guard Frontend.
- [ ] Kiểm thử API authorization Backend.
- [ ] Kiểm chứng audit log append-only.
- [ ] Review với stakeholder.
- [ ] Ghi nhận feedback.
- [ ] Sửa lỗi sau review.
- [ ] Cập nhật README và tài liệu API.
- [ ] Chốt Increment 1.

---

# GIAI ĐOẠN 3: Increment 2 - Quản lý lô hàng và chứng chỉ

## 3.1. Module quản lý lô hàng (UC08 - UC13)

- [ ] Thiết kế bảng lô hàng.
- [ ] Thiết kế trạng thái vòng đời lô hàng.
- [ ] Cài đặt cơ chế sinh ID lô hàng duy nhất.
- [ ] API tạo lô hàng mới.
- [ ] API cập nhật thông tin lô hàng.
- [ ] API hủy mềm lô hàng.
- [ ] API tra cứu lô hàng.
- [ ] API xem chi tiết lô hàng.
- [ ] API xem nguồn gốc lô hàng.
- [ ] API kiểm tra tồn kho.
- [ ] API cảnh báo hết hạn.
- [ ] Validate tên sản phẩm, loại thực phẩm, nguồn gốc, ngày thu hoạch, ngày đóng gói, số lượng, đơn vị tính.
- [ ] Không cho nhập số lượng âm.
- [ ] Không cho nhập ngày thu hoạch lớn hơn ngày hiện tại.
- [ ] Không cho sửa lô hàng khi đã xuất kho/đang vận chuyển/đã giao.
- [ ] Không xóa vật lý lô hàng, chỉ chuyển trạng thái hủy.
- [ ] Tự động tạo QR sau khi tạo lô hàng hợp lệ.
- [ ] Ghi audit log khi tạo lô hàng.
- [ ] Ghi audit log khi cập nhật lô hàng.
- [ ] Ghi audit log khi hủy lô hàng.
- [ ] UI danh sách lô hàng.
- [ ] UI thêm lô hàng.
- [ ] UI cập nhật lô hàng.
- [ ] UI hủy lô hàng.
- [ ] UI tra cứu/lọc lô hàng.
- [ ] UI chi tiết lô hàng theo tab: thông tin cơ bản, chứng chỉ, vận chuyển, lịch sử thay đổi.
- [ ] UI xem nguồn gốc lô hàng.
- [ ] Test UC08 - Quản lý lô hàng.
- [ ] Test UC09 - Thêm lô hàng mới.
- [ ] Test UC10 - Cập nhật thông tin lô hàng.
- [ ] Test UC11 - Hủy/Xóa lô hàng.
- [ ] Test UC12 - Tra cứu thông tin lô hàng.
- [ ] Test UC13 - Xem nguồn gốc lô hàng.

## 3.2. Module quản lý chứng chỉ (UC14 - UC18)

- [ ] Thiết kế bảng chứng chỉ.
- [ ] Thiết kế bảng liên kết lô hàng - chứng chỉ.
- [ ] Cấu hình nơi lưu file chứng chỉ.
- [ ] Giới hạn định dạng file được upload: PDF, PNG, JPG, JPEG.
- [ ] Giới hạn dung lượng file upload.
- [ ] Kiểm tra virus/malware cơ bản cho file upload nếu có điều kiện.
- [ ] API tải chứng chỉ.
- [ ] API cập nhật/thay thế chứng chỉ.
- [ ] API xóa/gỡ chứng chỉ không hợp lệ trước vận chuyển.
- [ ] API tra cứu chứng chỉ theo lô hàng.
- [ ] API tải xuống chứng chỉ.
- [ ] Kiểm tra hiệu lực chứng chỉ.
- [ ] Không cho xóa chứng chỉ khi lô hàng đã hoàn tất phân phối nếu ảnh hưởng dữ liệu lịch sử.
- [ ] Ghi audit log khi tải chứng chỉ.
- [ ] Ghi audit log khi cập nhật chứng chỉ.
- [ ] Ghi audit log khi xóa/gỡ chứng chỉ.
- [ ] UI danh sách chứng chỉ của lô hàng.
- [ ] UI upload chứng chỉ.
- [ ] UI cập nhật/thay thế chứng chỉ.
- [ ] UI xem/tải xuống chứng chỉ.
- [ ] UI trạng thái hiệu lực chứng chỉ.
- [ ] Test UC14 - Quản lý chứng chỉ.
- [ ] Test UC15 - Tải chứng chỉ.
- [ ] Test UC16 - Cập nhật thông tin chứng chỉ.
- [ ] Test UC17 - Xóa chứng chỉ.
- [ ] Test UC18 - Tra cứu chứng chỉ.

## 3.3. Review Increment 2

- [ ] Kiểm thử nghiệp vụ lô hàng.
- [ ] Kiểm thử nghiệp vụ chứng chỉ.
- [ ] Kiểm thử ràng buộc không sửa/xóa dữ liệu lịch sử sai quy định.
- [ ] Kiểm thử audit log của lô hàng và chứng chỉ.
- [ ] Review với stakeholder.
- [ ] Ghi nhận feedback.
- [ ] Sửa lỗi sau review.
- [ ] Cập nhật README và tài liệu API.
- [ ] Chốt Increment 2.

---

# GIAI ĐOẠN 4: Increment 3 - Vận chuyển, nhận hàng và đồng bộ offline

## 4.1. Module vận chuyển (UC19 - UC25)

- [ ] Thiết kế bảng đơn vận chuyển.
- [ ] Thiết kế bảng trạng thái vận chuyển/checkpoint.
- [ ] Thiết kế trạng thái vòng đời đơn vận chuyển.
- [ ] API tạo đơn vận chuyển.
- [ ] API gán đối tác vận chuyển.
- [ ] API gán tài xế/phương tiện.
- [ ] API cập nhật trạng thái vận chuyển.
- [ ] API cập nhật vị trí GPS.
- [ ] API cập nhật nhiệt độ bảo quản.
- [ ] API cập nhật tình trạng lô hàng tại trạm.
- [ ] API cập nhật thông tin vận chuyển trước khi khởi hành.
- [ ] API xem hành trình vận chuyển.
- [ ] API xác nhận nhận hàng.
- [ ] API báo cáo lỗi lô hàng.
- [ ] Không cho chỉnh sửa thông tin vận chuyển sau khi xe đã khởi hành, trừ nghiệp vụ được cho phép.
- [ ] Chuyển trạng thái lô hàng sang “Đang vận chuyển” khi tạo đơn vận chuyển.
- [ ] Chuyển trạng thái lô hàng sang “Đã nhận tại cửa hàng” khi cửa hàng xác nhận nhận hàng.
- [ ] Chuyển trạng thái lô hàng sang “Có khiếu nại” khi có báo cáo lỗi.
- [ ] Ghi audit log khi tạo đơn vận chuyển.
- [ ] Ghi audit log khi cập nhật trạng thái vận chuyển.
- [ ] Ghi audit log khi cập nhật thông tin vận chuyển.
- [ ] Ghi audit log khi cửa hàng xác nhận nhận hàng.
- [ ] Ghi audit log khi cửa hàng báo cáo lỗi.
- [ ] UI danh sách đơn vận chuyển.
- [ ] UI tạo đơn vận chuyển.
- [ ] UI cập nhật trạng thái tại trạm.
- [ ] UI check-in GPS/nhiệt độ/tình trạng.
- [ ] UI xem hành trình dạng timeline.
- [ ] UI xem hành trình trên bản đồ nếu có.
- [ ] UI xác nhận nhận hàng.
- [ ] UI báo cáo lỗi lô hàng kèm ảnh bằng chứng.
- [ ] Test UC19 - Quản lý vận chuyển.
- [ ] Test UC20 - Tạo đơn vận chuyển lô hàng.
- [ ] Test UC21 - Cập nhật trạng thái vận chuyển.
- [ ] Test UC22 - Cập nhật thông tin vận chuyển.
- [ ] Test UC23 - Xem hành trình vận chuyển.
- [ ] Test UC24 - Xác nhận nhận hàng.
- [ ] Test UC25 - Báo cáo lỗi lô hàng.

## 4.2. Offline Sync cho vận chuyển

- [ ] Thiết kế dữ liệu cần lưu offline.
- [ ] Tích hợp Service Worker.
- [ ] Tích hợp IndexedDB hoặc cơ chế lưu cục bộ tương đương.
- [ ] Cache danh sách đơn vận chuyển được phân công.
- [ ] Cho phép tài xế ghi nhận checkpoint khi mất mạng.
- [ ] Gắn trạng thái “chờ đồng bộ” cho dữ liệu offline.
- [ ] Backend API bulk-insert dữ liệu đồng bộ.
- [ ] Xử lý trùng dữ liệu khi đồng bộ lại.
- [ ] Xử lý xung đột dữ liệu theo timestamp hoặc version.
- [ ] Hiển thị trạng thái đồng bộ trên UI.
- [ ] Kiểm thử mất mạng khi cập nhật vận chuyển.
- [ ] Kiểm thử có mạng lại và đồng bộ thành công.
- [ ] Kiểm thử đồng bộ nhiều bản ghi cùng lúc.
- [ ] Kiểm thử dữ liệu đồng bộ vẫn ghi audit log đúng.

## 4.3. Review Increment 3

- [ ] Kiểm thử luồng vận chuyển từ tạo đơn đến nhận hàng.
- [ ] Kiểm thử báo cáo lỗi lô hàng.
- [ ] Kiểm thử mất kết nối và đồng bộ lại.
- [ ] Kiểm thử audit log của toàn bộ luồng vận chuyển.
- [ ] Review với stakeholder.
- [ ] Ghi nhận feedback.
- [ ] Sửa lỗi sau review.
- [ ] Cập nhật README và tài liệu API.
- [ ] Chốt Increment 3.

---

# GIAI ĐOẠN 5: Increment 4 - QR Code, truy xuất nguồn gốc và báo cáo

## 5.1. Module QR Code & Public Traceability (UC29 - UC31)

- [ ] Thiết kế bảng QR code.
- [ ] Thiết kế chuẩn nội dung QR.
- [ ] QR chứa URL dạng `/trace/{batch_id}` hoặc token truy xuất hợp lệ.
- [ ] Bổ sung chữ ký xác thực hoặc token chống giả mạo nếu có.
- [ ] API sinh mã QR cho lô hàng.
- [ ] API lấy QR theo lô hàng.
- [ ] API tải QR dạng PNG.
- [ ] API tải QR dạng PDF.
- [ ] API in QR theo mẫu tem nhãn.
- [ ] API quét/truy xuất QR.
- [ ] API fallback nhập mã lô hàng thủ công.
- [ ] API tăng biến đếm lượt quét QR.
- [ ] API lấy timeline truy xuất nguồn gốc.
- [ ] API hiển thị chứng chỉ liên quan trong trang truy xuất.
- [ ] API hiển thị hành trình vận chuyển trong trang truy xuất.
- [ ] Tích hợp thư viện sinh QR.
- [ ] Tích hợp thư viện Web Camera/HTML5 QR Scanner.
- [ ] Xử lý QR không hợp lệ.
- [ ] Xử lý QR không tồn tại.
- [ ] Xử lý QR bị mờ/rách/camera lỗi bằng nhập mã thủ công.
- [ ] Không yêu cầu khách hàng đăng nhập khi quét QR.
- [ ] Không hiển thị dữ liệu nhạy cảm trên trang public trace.
- [ ] Tối ưu API truy xuất QR bằng cache.
- [ ] Đảm bảo phản hồi truy xuất dưới 2 giây.
- [ ] UI quản lý QR.
- [ ] UI tải/in QR.
- [ ] UI quét QR trên trình duyệt.
- [ ] UI nhập mã lô hàng thủ công.
- [ ] UI public trace dạng timeline.
- [ ] UI hiển thị nguồn gốc, chứng chỉ, vận chuyển, trạng thái lô hàng.
- [ ] Test UC29 - Quản lý mã QR định danh.
- [ ] Test UC30 - Quét mã QR truy xuất.
- [ ] Test UC31 - In/Tải xuống mã QR.

## 5.2. Module báo cáo và thống kê (UC37 - UC41)

- [ ] Thiết kế dashboard báo cáo.
- [ ] API thống kê số lượng lô hàng theo thời gian.
- [ ] API thống kê lô hàng theo trạng thái.
- [ ] API thống kê theo nhà cung cấp.
- [ ] API thống kê số lượng QR đã tạo.
- [ ] API thống kê số lượt quét QR.
- [ ] API thống kê tồn kho.
- [ ] API cảnh báo lô hàng sắp hết hạn.
- [ ] API xuất báo cáo Excel.
- [ ] API xuất báo cáo PDF.
- [ ] UI dashboard tổng quan.
- [ ] UI biểu đồ lô hàng.
- [ ] UI biểu đồ lượt quét QR.
- [ ] UI tồn kho.
- [ ] UI cảnh báo hết hạn.
- [ ] UI xuất báo cáo Excel/PDF.
- [ ] Ghi audit log khi xuất báo cáo quan trọng.
- [ ] Test UC37 - Quản lý báo cáo và thống kê.
- [ ] Test UC38 - Thống kê lô hàng.
- [ ] Test UC39 - Xuất báo cáo.
- [ ] Test UC40 - Kiểm tra tồn kho.
- [ ] Test UC41 - Xem cảnh báo hết hạn.

## 5.3. Review Increment 4

- [ ] Kiểm thử toàn bộ vòng đời QR.
- [ ] Kiểm thử public trace không cần đăng nhập.
- [ ] Kiểm thử tốc độ truy xuất dưới 2 giây.
- [ ] Kiểm thử thống kê và báo cáo.
- [ ] Review với stakeholder.
- [ ] Ghi nhận feedback.
- [ ] Sửa lỗi sau review.
- [ ] Cập nhật README và tài liệu API.
- [ ] Chốt Increment 4.

---

# GIAI ĐOẠN 6: Kiểm thử tổng thể, bảo mật và hiệu năng

## 6.1. Kiểm thử tích hợp toàn hệ thống

- [ ] Test luồng từ tạo tài khoản đến phân quyền.
- [ ] Test luồng tạo hồ sơ đối tác.
- [ ] Test luồng tạo lô hàng.
- [ ] Test luồng upload chứng chỉ.
- [ ] Test luồng tạo đơn vận chuyển.
- [ ] Test luồng cập nhật vận chuyển.
- [ ] Test luồng xác nhận nhận hàng.
- [ ] Test luồng báo cáo lỗi lô hàng.
- [ ] Test luồng sinh QR.
- [ ] Test luồng quét QR public.
- [ ] Test luồng xem audit log.
- [ ] Test luồng báo cáo thống kê.
- [ ] Test phân quyền theo Admin, Nông trại, Đối tác vận chuyển, Cửa hàng, Khách hàng.
- [ ] Test dữ liệu liên kết giữa lô hàng - chứng chỉ - vận chuyển - QR - audit log.

## 6.2. Kiểm thử bảo mật

- [ ] Làm sạch dữ liệu đầu vào.
- [ ] Kiểm thử SQL Injection.
- [ ] Kiểm thử XSS.
- [ ] Kiểm thử CSRF nếu dùng cookie/session.
- [ ] Kiểm thử broken access control.
- [ ] Kiểm thử upload file độc hại.
- [ ] Kiểm thử lộ file `.env` hoặc secret.
- [ ] Kiểm thử API không có token.
- [ ] Kiểm thử API dùng token sai vai trò.
- [ ] Kiểm thử sửa dữ liệu lô hàng không thuộc quyền.
- [ ] Kiểm thử sửa/xóa audit log qua API.
- [ ] Kiểm thử sửa/xóa audit log trực tiếp ở database.
- [ ] Kiểm thử QR giả mạo batch_id.
- [ ] Kiểm thử public trace không lộ dữ liệu nội bộ.
- [ ] Ghi nhận và fix lỗi bảo mật.

## 6.3. Kiểm thử hiệu năng và tương thích

- [ ] Load test API truy xuất QR.
- [ ] Giả lập 100.000 lượt quét QR/năm.
- [ ] Kiểm thử phản hồi truy xuất dưới 2 giây.
- [ ] Kiểm thử phân trang danh sách lô hàng lớn.
- [ ] Kiểm thử tra cứu audit log với dữ liệu lớn.
- [ ] Kiểm thử upload/download chứng chỉ.
- [ ] Kiểm thử dashboard báo cáo với dữ liệu lớn.
- [ ] Kiểm thử trên Chrome.
- [ ] Kiểm thử trên Edge.
- [ ] Kiểm thử trên Firefox nếu có điều kiện.
- [ ] Kiểm thử giao diện mobile/tablet.
- [ ] Kiểm thử camera QR trên thiết bị di động.
- [ ] Tối ưu query database.
- [ ] Tối ưu index cho batch_id, qr_code, audit_log, transport_status.
- [ ] Tối ưu cache cho trace API.

## 6.4. Sao lưu, phục hồi và regression

- [ ] Thiết lập backup database tự động.
- [ ] Thiết lập backup file upload/chứng chỉ.
- [ ] Giả lập mất dữ liệu.
- [ ] Khôi phục từ backup.
- [ ] Kiểm tra sau restore: lô hàng còn đúng.
- [ ] Kiểm tra sau restore: chứng chỉ còn đúng.
- [ ] Kiểm tra sau restore: QR vẫn truy xuất được.
- [ ] Kiểm tra sau restore: audit log không mất/sai.
- [ ] Kiểm tra sau restore: trạng thái vận chuyển còn đúng.
- [ ] Fix lỗi phát hiện trong kiểm thử tổng thể.
- [ ] Regression test toàn hệ thống.
- [ ] Ký biên bản kiểm thử.

---

# GIAI ĐOẠN 7: Triển khai, đào tạo và bàn giao

## 7.1. Tài liệu và đào tạo

- [ ] Soạn hướng dẫn sử dụng cho Admin.
- [ ] Soạn hướng dẫn sử dụng cho Nông trại.
- [ ] Soạn hướng dẫn sử dụng cho Đối tác vận chuyển.
- [ ] Soạn hướng dẫn sử dụng cho Cửa hàng.
- [ ] Soạn hướng dẫn sử dụng chức năng quét QR.
- [ ] Soạn tài liệu kỹ thuật cài đặt và vận hành.
- [ ] Soạn tài liệu API.
- [ ] Soạn tài liệu database/schema.
- [ ] Quay video demo.
- [ ] Tổ chức đào tạo thực tế.
- [ ] Ghi nhận câu hỏi và phản hồi sau đào tạo.

## 7.2. Staging, migration và UAT

- [ ] Thiết lập môi trường staging.
- [ ] Deploy bản staging.
- [ ] Làm sạch dữ liệu lô hàng lịch sử.
- [ ] Chuyển đổi dữ liệu lô hàng lịch sử về đúng format.
- [ ] Nhập dữ liệu lịch sử vào staging.
- [ ] Kiểm tra dữ liệu sau migration.
- [ ] Hỗ trợ UAT với dữ liệu thật.
- [ ] Ghi nhận lỗi UAT.
- [ ] Sửa lỗi UAT.
- [ ] Regression test sau UAT.
- [ ] Xác nhận UAT đạt yêu cầu.

## 7.3. Production và Hypercare

- [ ] Cấu hình cloud/server production.
- [ ] Cấu hình domain.
- [ ] Cấu hình SSL.
- [ ] Cấu hình database production.
- [ ] Cấu hình storage production.
- [ ] Cấu hình auto-backup.
- [ ] Cấu hình monitoring/logging cơ bản.
- [ ] Build Frontend production.
- [ ] Build Backend production.
- [ ] Deploy production.
- [ ] Kiểm tra health check sau deploy.
- [ ] Kiểm tra đăng nhập production.
- [ ] Kiểm tra tạo lô hàng production.
- [ ] Kiểm tra quét QR production.
- [ ] Kiểm tra audit log production.
- [ ] Hypercare 7 ngày sau triển khai.
- [ ] Ghi nhận lỗi phát sinh trong hypercare.
- [ ] Fix lỗi phát sinh trong hypercare.

## 7.4. Bàn giao và nghiệm thu

- [ ] Bàn giao tài khoản Admin.
- [ ] Bàn giao source code.
- [ ] Bàn giao database mẫu.
- [ ] Bàn giao tài liệu người dùng.
- [ ] Bàn giao tài liệu kỹ thuật.
- [ ] Bàn giao tài liệu API.
- [ ] Bàn giao hướng dẫn backup/restore.
- [ ] Bàn giao hướng dẫn triển khai lại hệ thống.
- [ ] Chốt biên bản nghiệm thu.
- [ ] Lessons learned.
- [ ] Giải tán đội dự án.
- [ ] Kết thúc dự án.

---

# 8. Checklist tiêu chuẩn hoàn thành cho từng module

Một module chỉ được xem là hoàn thành khi đạt đủ các điều kiện sau:

- [ ] Có API hoạt động đúng.
- [ ] Có UI tương ứng.
- [ ] Có validate dữ liệu đầu vào.
- [ ] Có kiểm tra phân quyền.
- [ ] Có audit log cho thao tác quan trọng.
- [ ] Có xử lý lỗi cơ bản.
- [ ] Có test case luồng chính.
- [ ] Có test case luồng lỗi.
- [ ] Có cập nhật README/API document.
- [ ] Có dữ liệu mẫu hoặc hướng dẫn tạo dữ liệu test.
- [ ] Đã được review code.
- [ ] Đã được review nghiệp vụ.
- [ ] Không làm sai tiêu chí audit log append-only.
- [ ] Không làm lộ dữ liệu nhạy cảm.

---

# 9. Checklist rủi ro trọng yếu

## 9.1. Toàn vẹn dữ liệu

- [ ] Không xóa vật lý dữ liệu lịch sử quan trọng.
- [ ] Không cho sửa/xóa audit log.
- [ ] Có ràng buộc khóa chính/khóa ngoại phù hợp.
- [ ] Có transaction cho nghiệp vụ nhiều bước.
- [ ] Có kiểm soát cập nhật đồng thời.
- [ ] Có backup và restore.

## 9.2. Gian lận nguồn gốc

- [ ] QR gắn đúng lô hàng.
- [ ] Batch ID duy nhất.
- [ ] Có audit log mọi thay đổi nguồn gốc.
- [ ] Có ghi nhận người thực hiện và thời gian.
- [ ] Public trace chỉ đọc, không cho chỉnh sửa.
- [ ] Có phát hiện QR không hợp lệ.

## 9.3. Dữ liệu nhập sai

- [ ] Validate form ở Frontend.
- [ ] Validate lại ở Backend.
- [ ] Kiểm tra trạng thái trước khi cho thao tác.
- [ ] Có thông báo lỗi rõ ràng.
- [ ] Có ghi log lỗi quan trọng.
- [ ] Có review dữ liệu đầu vào từ đối tác.

## 9.4. Phạm vi mở rộng không kiểm soát

- [ ] Mọi yêu cầu mới phải được ghi vào backlog.
- [ ] Phân loại yêu cầu mới: Must have, Should have, Could have.
- [ ] Không thêm tính năng ngoài phạm vi nếu ảnh hưởng deadline.
- [ ] Có xác nhận của PO/giảng viên trước khi đổi phạm vi lớn.

---

# 10. Backlog đề xuất sau nghiệm thu

- [ ] Bổ sung thông báo realtime.
- [ ] Bổ sung bản đồ hành trình nâng cao.
- [ ] Bổ sung dashboard nâng cao theo từng vai trò.
- [ ] Bổ sung phân tích dữ liệu quét QR.
- [ ] Bổ sung cảnh báo gian lận nguồn gốc.
- [ ] Bổ sung chữ ký số cho chứng chỉ.
- [ ] Tối ưu mobile PWA nâng cao.
- [ ] Tích hợp thiết bị IoT nhiệt độ nếu có điều kiện.
- [ ] Tích hợp blockchain thật nếu doanh nghiệp yêu cầu ở giai đoạn sau.
