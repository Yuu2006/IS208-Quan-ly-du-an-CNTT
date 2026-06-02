# **DANH SÁCH USE CASE**

| Mã UC | Tên Use case | Mô tả Use case |
| :---: | ----- | ----- |
| **GÓI 3: Quản lý chứng chỉ** |  |  |
| **UC14** | Quản lý chứng chỉ | Gói chức năng tổng hợp cho phép nông trại tải lên, cập nhật, xóa và tra cứu chứng chỉ chất lượng liên quan đến lô hàng.  |
| **UC15** | Tải chứng chỉ | Nông trại tải lên các tài liệu, hình ảnh chứng minh chất lượng (VietGAP, GlobalGAP) cho lô hàng. |
| **UC16** | Cập nhật thông tin chứng chỉ | Nông trại cập nhật hoặc thay thế file chứng chỉ nếu phát hiện tải lên nhầm tài liệu trước đó. |
| **UC17** | Xóa chứng chỉ | Nông trại gỡ bỏ những chứng chỉ không hợp lệ khỏi lô hàng trước khi lô hàng được vận chuyển. |
| **UC18** | Tra cứu chứng chỉ | Cho phép người dùng xem danh sách chứng chỉ của một lô hàng và kiểm tra tình trạng hiệu lực.  |

# 

**GÓI 3 - QUẢN LÝ CHỨNG CHỈ**

| Tên Use-case | Quản lý chứng chỉ |
| :---: | :---- |
| **ID** | UC14 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Nông trại |
| **Mô tả** | Gói chức năng tổng hợp cho phép nông trại tải lên, cập nhật, xóa và tra cứu chứng chỉ chất lượng liên quan đến lô hàng.  |
| **Sự kiện kích hoạt** | Nông trại chọn một lô hàng trong danh sách và nhấn chọn chức năng "Thêm chứng chỉ mới".  |
| **Tiền điều kiện** | - Nông trại đã đăng nhập thành công vào hệ thống. - Lô hàng đã được khởi tạo thành công và đang ở trạng thái chưa hoàn tất phân phối.  |
| **Hậu điều kiện** | - Các thay đổi về chứng chỉ được cập nhật trong CSDL và ghi nhận audit log. - Danh sách chứng chỉ hiển thị chính xác theo dữ liệu mới nhất.  |
| **Luồng sự kiện chính** | Nông trại chọn một lô hàng từ danh sách. Hệ thống hiển thị giao diện quản lý chứng chỉ của lô hàng đó, bao gồm danh sách các chứng chỉ đã tải lên (nếu có). Hệ thống hiển thị các chức năng: Tải chứng chỉ, Cập nhật, Xóa, Tra cứu chứng chỉ. Nông trại xác định hành động muốn thực hiện: - Nếu chọn "Tải chứng chỉ", hệ thống thực hiện UC15: Tải chứng chỉ. - Nếu chọn "Cập nhật", hệ thống thực hiện UC16: Cập nhật thông tin chứng chỉ. - Nếu chọn "Xóa", hệ thống thực hiện UC17: Xóa chứng chỉ. - Nếu chọn "Tra cứu", hệ thống thực hiện UC18: Tra cứu chứng chỉ. Kết thúc Use case.  |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có |

### **Đặc tả use case: Tải chứng chỉ**

| Tên Use-case | Tải chứng chỉ |
| :---: | :---- |
| **Mã Use-case** | UC15 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Nông trại  |
| **Mô tả** | Nông trại tải lên các tài liệu, hình ảnh chứng minh chất lượng (VietGAP, GlobalGAP) cho lô hàng. |
| **Sự kiện kích hoạt** | Nông trại nhấn nút "Tải chứng chỉ" trên giao diện quản lý chứng chỉ. |
| **Tiền điều kiện** | - Nông trại đã đăng nhập và có quyền trên lô hàng hiện tại. |
| **Hậu điều kiện** | - Một bản ghi chứng chỉ mới được tạo trong CSDL. - File chứng chỉ được lưu trên server (hoặc cloud storage). - Hệ thống ghi nhận hành động vào audit log. |
| **Luồng sự kiện chính** | 1. Hệ thống hiển thị biểu mẫu nhập liệu với các trường: Loại chứng chỉ, Ngày cấp, Ngày hết hạn, Đơn vị cấp, và bộ chọn file (PDF, JPG, PNG). 2. Nông trại nhập đầy đủ thông tin bắt buộc (loại, ngày cấp, đơn vị cấp) và chọn file. 3. Nông trại nhấn nút "Lưu". 4. Hệ thống kiểm tra tính hợp lệ của dữ liệu. 5. Hệ thống lưu file, bản ghi vào CSDL và thông báo "Tải chứng chỉ thành công". 6. Kết thúc Use case. |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 4a. Nếu dữ liệu không hợp lệ: Hệ thống hiển thị lỗi và yêu cầu chọn lại. |

### **Đặc tả use case: Cập nhật thông tin chứng chỉ**

| Tên Use-case | Cập nhật thông tin chứng chỉ |
| :---: | :---- |
| **Mã Use-case** | UC16 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Nông trại |
| **Mô tả** | Cho phép Nông trại chỉnh sửa thông tin của một chứng chỉ đã tải lên hoặc thay thế file chứng chỉ. |
| **Sự kiện kích hoạt** | Nông trại chọn một chứng chỉ từ danh sách và nhấn nút "Cập nhật". |
| **Tiền điều kiện** | - Chứng chỉ đã tồn tại trong hệ thống. - Nông trại có quyền trên lô hàng liên kết với chứng chỉ. |
| **Hậu điều kiện** | - Thông tin chứng chỉ được cập nhật trong CSDL. - Ghi nhận hành động vào audit log. |
| **Luồng sự kiện chính** | 1. Nông trại tra cứu và chọn chứng chỉ cần chỉnh sửa. 2. Nông trại nhất nút “Cập nhật”. 3. Hệ thống kiểm tra trạng thái lô hàng và hiển thị biểu mẫu chỉnh sửa với toàn bộ thông tin hiện tại của chứng chỉ. 4. Nông trại sửa đổi các trường cần thiết. 5. Nông trại nhấn nút "Lưu thay đổi". 6. Hệ thống kiểm tra tính hợp lệ. 7. Hệ thống cập nhật bản ghi chứng chỉ trong CSDL. 8. Hệ thống thông báo "Cập nhật chứng chỉ thành công" và làm mới danh sách. 9. Kết thúc Use case. |
| **Luồng sự kiện phụ** | 5a. Nếu nông trại không thay đổi gì mà vẫn nhấn lưu, hệ thống thông báo “Không có thay đổi” và quay lại danh sách. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 3a. Nếu lô hàng đã vận chuyển, hệ thống hiển thị thông báo và kết thúc use case. |

### **Đặc tả use case: Xóa chứng chỉ**

| Tên Use-case | Xóa chứng chỉ |
| :---: | :---- |
| **Mã Use-case** | UC17 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Nông trại |
| **Mô tả** | Nông trại gỡ bỏ những chứng chỉ không hợp lệ khỏi lô hàng trước khi lô hàng được vận chuyển. |
| **Sự kiện kích hoạt** | Nông trại chọn một chứng chỉ từ danh sách và nhấn nút "Xóa". |
| **Tiền điều kiện** | - Nông trại đã đăng nhập thành công. - Nông trại đang ở giao diện danh sách chứng chỉ của một lô hàng. - Chứng chỉ cần xóa đã tồn tại trong hệ thống.  |
| **Hậu điều kiện** | - Bản ghi chứng chỉ bị xóa khỏi CSDL, file chứng chỉ bị xóa khỏi server. - Hành động được ghi nhận vào audit log.  |
| **Luồng sự kiện chính** | 1. Nông trại tìm kiếm và chọn chứng chỉ cần xóa từ danh sách. 2. Nông trại nhấn nút "Xóa". 3. Hệ thống kiểm tra trạng thái vận chuyển của lô hàng liên kết với chứng chỉ. 4. Hệ thống xác định lô hàng chưa được vận chuyển và hiển thị hộp thoại xác nhận: *"Bạn có chắc chắn muốn xóa vĩnh viễn chứng chỉ này?"* 5. Nông trại nhấn "Xác nhận". 6. Hệ thống thực hiện xóa bản ghi chứng chỉ trong CSDL, xóa file vật lý. 7. Hệ thống hiển thị thông báo *"Xóa chứng chỉ thành công"* và làm mới danh sách. 8. Kết thúc Use Case.  |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 3a. Nếu lô hàng đã được vận chuyển, hệ thống hiển thị thông báo lỗi và từ chối xóa. |

## **Đặc tả use case: Tra cứu chứng chỉ**

| Mã Use-case | UC18 |
| :---: | :---- |
| **Tên Use-case** | Tra cứu chứng chỉ |
| **Tác nhân** | Quản trị viên, Nông trại, Đơn vị vận chuyển, Cửa hàng  |
| **Mô tả** | Cho phép người dùng xem danh sách chứng chỉ của một lô hàng và kiểm tra tình trạng hiệu lực.  |
| **Tiền điều kiện** | - Người dùng đã đăng nhập thành công vào hệ thống và đã chọn một lô hàng cụ thể. |
| **Hậu điều kiện** | Hiển thị danh sách chứng chỉ của lô hàng kèm trạng thái hiệu lực.  |
| **Luồng sự kiện chính** | 1. Hệ thống hiển thị giao diện chi tiết lô hàng. 2. Người dùng chọn “Xem chứng chỉ”. 3. Hệ thống truy vấn tất cả chứng chỉ liên kết với lô hàng đó từ CSDL.  4. Hệ thống hiển thị danh sách bao gồm: Loại chứng chỉ, Ngày cấp, Ngày hết hạn, Đơn vị cấp, Trạng thái hiệu lực. 5. Người dùng nhấn vào nút "Xem chi tiết" hoặc "Tải về" tại một chứng chỉ cụ thể. 6. Hệ thống mở tab mới hiển thị tệp hình ảnh/PDF của chứng chỉ để người dùng kiểm chứng trực quan. 7. Kết thúc Use Case.  |
| **Luồng sự kiện phụ** | 4a. Nếu lô hàng không có bất kỳ chứng chỉ nào, hệ thống hiển thị thông báo *“Lô hàng chưa có chứng chỉ nào”*.  |
| **Luồng sự kiện lỗi và ngoại lệ** | Không có |

# 

| GÓI 9: Báo cáo và thống kê |  |  |
| :---: | :---- | :---- |
| **UC41** | Quản lý báo cáo và thống kê | Gói chức năng tổng hợp cho phép quản trị viên thống kê lô hàng, xuất báo cáo, kiểm tra tồn kho và nhận cảnh báo hết hạn.  |
| **UC42** | Thống kê lô hàng | Cho phép quản trị viên thống kê số lượng lô hàng theo thời gian, trạng thái, nhà cung cấp, số lượng QR đã tạo, số lượt quét QR.  |
| **UC43** | Xuất báo cáo  | Cho phép xuất báo cáo thống kê ra định dạng PDF hoặc Excel để lưu trữ, gửi cho các bên liên quan.  |
| **UC44** | Kiểm tra tồn kho | Cho phép quản trị viên xem số lượng tồn kho hiện tại của từng lô hàng.  |
| **UC45** | Xem cảnh báo hết hạn | Cho phép quản trị viên xem danh sách các lô hàng sắp hết hạn sử dụng.  |

### **Đặc tả use case: Quản lý báo cáo và thống kê**

| Tên Use-case | Quản lý báo cáo và thống kê |
| :---: | :---- |
| **Mã Use-case** | UC41 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Gói chức năng tổng hợp cho phép quản trị viên và bộ phận kiểm tra thống kê lô hàng, xuất báo cáo, kiểm tra tồn kho và nhận cảnh báo hết hạn. |
| **Sự kiện kích hoạt** | Người dùng có quyền truy cập vào màn hình "Báo cáo & Thống kê" của hệ thống. |
| **Tiền điều kiện** | - Người dùng đã đăng nhập thành công. - Người dùng có vai trò Quản trị viên hoặc Bộ phận kiểm tra. |
| **Hậu điều kiện** | - Các thông tin thống kê, báo cáo, tồn kho, cảnh báo được hiển thị hoặc xuất ra đúng yêu cầu. - Không làm thay đổi dữ liệu nghiệp vụ. |
| **Luồng sự kiện chính** | 1. Hệ thống hiển thị màn hình chính của phân hệ Báo cáo & Thống kê, với các lựa chọn: Thống kê lô hàng, Xuất báo cáo, Kiểm tra tồn kho, Xem cảnh báo hết hạn. 2. Người dùng chọn một chức năng: - Nếu chọn "Thống kê lô hàng", hệ thống thực hiện UC42: Thống kê lô hàng. - Nếu chọn "Kiểm tra tồn kho", hệ thống thực hiện UC44: Kiểm tra tồn kho. - Nếu chọn "Xem cảnh báo hết hạn", hệ thống thực hiện UC45: Xem cảnh báo hết hạn. 3. Kết thúc Use case. |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có |

### **Đặc tả use case: Thống kê lô hàng**

| Tên Use-case | Thống kê lô hàng |
| :---: | :---- |
| **Mã Use-case** | UC42 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Cho phép quản trị viên thống kê số lượng lô hàng theo các tiêu chí khác nhau như thời gian, trạng thái, nhà cung cấp, số lượng QR đã tạo, số lượt quét QR. |
| **Sự kiện kích hoạt** | Người dùng nhấn chức năng "Thống kê lô hàng" từ màn hình chính của trang Báo cáo & Thống kê. |
| **Tiền điều kiện** | - Đã đăng nhập với vai trò Quản trị viên. |
| **Hậu điều kiện** | - Hiển thị bảng thống kê theo các tiêu chí đã chọn. |
| **Luồng sự kiện chính** | 1. Hệ thống hiển thị giao diện thống kê với các bộ lọc: Khoảng thời gian, Trạng thái lô hàng, Nhà cung cấp. 2. Quản trị viên chọn các bộ lọc mong muốn và nhấn "Thống kê". 3. Hệ thống truy vấn CSDL, tính toán số lượng lô hàng, tổng số QR đã tạo, tổng số lượt quét QR trong khoảng thời gian đó. 4. Hệ thống hiển thị kết quả dưới dạng bảng. 5. Nếu quản trị viên chọn “Xuất báo cáo”, hệ thống thực hiện UC43: Xuất báo cáo. 5. Kết thúc Use case. |
| **Luồng sự kiện phụ** | 4a. Nếu không có dữ liệu thỏa mãn, hiển thị thông báo "Không có lô hàng nào phù hợp". |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có |

### **Đặc tả use case: Xuất báo cáo**

| Tên Use-case | Xuất báo cáo |
| :---: | :---- |
| **Mã Use-case** | UC43 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Quản trị viên, |
| **Mô tả** | Cho phép xuất báo cáo thống kê lô hàng ra định dạng PDF hoặc Excel để lưu trữ hoặc gửi cho các bên liên quan. |
| **Sự kiện kích hoạt** | Sau khi thống kê tại UC42, người dùng nhấn nút "Xuất báo cáo". |
| **Tiền điều kiện** | - Đã thực hiện thống kê thành công với ít nhất một bộ lọc. |
| **Hậu điều kiện** | - Một file PDF hoặc Excel được tạo và tải xuống máy của người dùng. - Ghi nhận hành động xuất báo cáo vào audit log. |
| **Luồng sự kiện chính** | 1. Hệ thống hiển thị hộp thoại chọn định dạng PDF hoặc Excel. 2. Quản trị viên chọn định dạng và nhấn "Xuất". 3. Hệ thống sinh file báo cáo từ dữ liệu thống kê hiện tại. 4. Hệ thống gửi file về trình duyệt để tải xuống và hiển thị thông báo "Xuất báo cáo thành công". 5. Kết thúc Use case. |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 3a. Lỗi sinh file: Thông báo lỗi và không tạo file. |

### **Đặc tả use case: Kiểm tra tồn kho**

| Tên Use-case | Kiểm tra tồn kho |
| :---: | :---- |
| **Mã Use-case** | UC44 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Cho phép quản trị viên xem số lượng tồn kho hiện tại của từng lô hàng.  |
| **Sự kiện kích hoạt** | Quản trị viên chọn chức năng "Kiểm tra tồn kho" từ màn hình chính của trang Báo cáo & Thống kê. |
| **Tiền điều kiện** | - Quản trị viên đã đăng nhập. |
| **Hậu điều kiện** | Hiển thị danh sách lô hàng kèm số lượng tồn kho hiện tại. |
| **Luồng sự kiện chính** | 1. Hệ thống hiển thị giao diện với danh sách tất cả lô hàng. 2. Hệ thống truy vấn CSDL, tính tồn kho cho từng lô hàng. 3. Hệ thống hiển thị bảng gồm: Mã lô, tên sản phẩm, số lượng ban đầu, số lượng đã xuất, tồn kho hiện tại. 4. Kết thúc Use case. |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có |

### **Đặc tả use case: Xem cảnh báo hết hạn**

| Tên Use-case | Cảnh báo hết hạn |
| :---: | :---- |
| **Mã Use-case** | UC45 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Hệ thống, Quản trị viên |
| **Mô tả** | Cho phép quản trị viên xem danh sách các lô hàng sắp hết hạn sử dụng.  |
| **Sự kiện kích hoạt** | - Quản trị viên nhấn "Xem cảnh báo hết hạn" từ màn hình chính của trang Báo cáo & Thống kê . |
| **Tiền điều kiện** | - Quản trị viên đã đăng nhập thành công vào hệ thống. |
| **Hậu điều kiện** | - Hiển thị danh sách các lô hàng sắp hết hạn để quản trị viên nắm bắt và xử lý.  |
| **Luồng sự kiện chính** | 1. Hệ thống hiển thị giao diện cảnh báo hết hạn. 2. Hệ thống truy vấn các lô hàng có ngày hết hạn nằm trong khoảng đã được thiết lập. 3. Hệ thống hiển thị danh sách kết quả gồm: Mã lô, tên sản phẩm, ngày hết hạn, số ngày còn lại, trạng thái hiện tại. 4. Quản trị viên có thể chọn vào từng lô hàng để xem chi tiết. 5. Kết thúc Use case.  |
| **Luồng sự kiện phụ** | 3a. Nếu không có lô hàng nào sắp hết hạn, hệ thống hiển thị thông báo "Không có lô hàng nào sắp hết hạn".  |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có |
