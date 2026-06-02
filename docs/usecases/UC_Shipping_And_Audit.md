# **DANH SÁCH USE CASE**

| Mã UC | Tên Use case | Mô tả Use case |
| :---: | ----- | ----- |
| **GÓI 4: Quản lý vận chuyển** |  |  |
| **UC19** | Quản lý vận chuyển | … |
| **UC20** | Tạo đơn vận chuyển lô hàng | … |
| **UC21** | Cập nhật trạng thái vận chuyển | Đối tác vận chuyển cập nhật vị trí, nhiệt độ và tình trạng lô hàng tại các trạm kiểm soát |
| **UC22** | Cập nhật thông tin vận chuyển | Đối tác vận chuyển thay đổi thông tin về biển số xe hoặc tài xế phụ trách trước khi xe khởi hành. |
| **UC23** | Xem hành trình vận chuyển | Đối tác vận chuyển và quản trị viên theo dõi lại toàn bộ các điểm dừng đỗ của chuyến xe. (trạng thái vận chuyển của lô h |
| **UC24** | Xác nhận nhận hàng | Cửa hàng chốt thao tác nhận lô hàng thành công từ đơn vị vận chuyển để đưa vào phân phối. |
| **UC25** | Báo cáo lỗi lô hàng | Cửa hàng ghi nhận tình trạng hàng hóa bị hỏng hóc hoặc thiếu hụt so với thông tin ban đầu. |
| **GÓI 5: Quản lý Audit Log** |  |  |
| **UC26** | Quản lý Audit Log | … |
| **UC27** | Xem lịch sử thay đổi lô hàng | …UC22 để xem *log hệ thống* (dành cho Admin) |
| **UC28** | Tra cứu Audit Log | Quản trị viên kiểm tra hệ thống nhật ký lưu vết bất biến (chỉ thêm, không xóa/sửa) để đảm bảo tính minh bạch |

# 

# **![][image1]![][image2]**

# **GÓI 4: Quản lý vận chuyển**

## **UC19: Quản lý vận chuyển**

| Tên Use-case | Quản lý vận chuyển |
| :---: | :---- |
| **Mã Use-case** | UC19 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Cho phép Quản trị viên xem tổng quan toàn bộ đơn vận chuyển trong hệ thống, bao gồm tạo mới, theo dõi trạng thái và điều phối các đơn vị vận chuyển.  |
| **Sự kiện kích hoạt** | Quản trị viên truy cập vào module "Quản lý vận chuyển" trên hệ thống. |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập hệ thống với quyền quản lý vận chuyển. |
| **Hậu điều kiện** | Danh sách đơn vận chuyển được hiển thị; Quản trị viên có thể thao tác với từng đơn. |
| **Luồng sự kiện chính** | Quản trị viên chọn menu "Quản lý vận chuyển". Hệ thống truy vấn và hiển thị danh sách tất cả đơn vận chuyển (ID lô hàng, tuyến đường, đối tác vận chuyển, trạng thái hiện tại, ngày tạo). Quản trị viên áp dụng bộ lọc (theo trạng thái, ngày, đối tác) hoặc tìm kiếm theo ID lô hàng. Hệ thống cập nhật danh sách theo tiêu chí lọc. Quản trị viên chọn thao tác: Tạo mới (UC20) / Xem hành trình (UC23) / Xem chi tiết đơn. |
| **Luồng sự kiện phụ** | 1a: Danh sách rỗng — hệ thống hiển thị thông báo "Chưa có đơn vận chuyển nào". |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có |

## **UC20: Tạo đơn vận chuyển lô hàng**

| Tên Use-case | Tạo đơn vận chuyển lô hàng |
| :---: | :---- |
| **Mã Use-case** | UC20 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Cho phép Quản trị viên tạo một đơn vận chuyển mới để giao lô hàng từ kho BlueFood đến cửa hàng đích, bao gồm việc chỉ định đối tác vận chuyển, tài xế và phương tiện. |
| **Sự kiện kích hoạt** | Quản trị viên nhấn nút "Tạo đơn vận chuyển" trong màn hình Quản lý vận chuyển (UC19). |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập và có quyền tạo đơn vận chuyển. Lô hàng cần vận chuyển đã tồn tại trong hệ thống với ID duy nhất và trạng thái "Sẵn sàng vận chuyển". Ít nhất một đối tác vận chuyển đã được đăng ký trong hệ thống. |
| **Hậu điều kiện** | Đơn vận chuyển được tạo thành công với ID duy nhất. Trạng thái lô hàng chuyển sang "Đang vận chuyển". Hệ thống ghi audit log: "Tạo đơn vận chuyển \[ID\] cho lô hàng \[ID\] bởi \[user\] lúc \[thời gian\]". Thông báo được gửi đến đối tác vận chuyển được chỉ định. |
| **Luồng sự kiện chính** | Quản trị viên nhấn "Tạo đơn vận chuyển". Hệ thống hiển thị form tạo đơn với các trường: ID lô hàng, cửa hàng đích, đối tác vận chuyển, tài xế, biển số xe, ngày khởi hành dự kiến, ghi chú. Quản trị viên tìm kiếm và chọn lô hàng cần vận chuyển từ danh sách. Quản trị viên chọn cửa hàng đích từ danh sách cửa hàng đã đăng ký. Quản trị viên chọn đối tác vận chuyển và điền thông tin tài xế, biển số xe. Quản trị viên nhấn "Xác nhận tạo đơn". Hệ thống xác thực dữ liệu đầu vào. Hệ thống tạo đơn vận chuyển, cập nhật trạng thái lô hàng và ghi audit log. Hệ thống hiển thị thông báo "Tạo đơn vận chuyển thành công"  |
| **Luồng sự kiện phụ** | Quản trị viên thêm nhiều lô hàng vào cùng một đơn vận chuyển |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | E1: Thiếu trường bắt buộc (tài xế, biển số xe, cửa hàng đích) — hệ thống highlight trường lỗi và yêu cầu nhập đủ. E2: Ngày khởi hành trong quá khứ — hệ thống hiển thị cảnh báo "Ngày khởi hành không hợp lệ". |

## **UC21: Cập nhật trạng thái vận chuyển**

| Tên Use-case | Cập nhật trạng thái vận chuyển |
| :---: | :---- |
| **Mã Use-case** | UC21 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Đối tác vận chuyển |
| **Mô tả** | Cho phép Đối tác vận chuyển ghi nhận thông tin tại các trạm kiểm soát trong hành trình, bao gồm vị trí GPS, nhiệt độ bảo quản và tình trạng lô hàng. Mỗi lần cập nhật được ghi vào audit log bất biến. |
| **Sự kiện kích hoạt** | Xe đến một trạm kiểm soát trên hành trình vận chuyển; Đối tác vận chuyển mở ứng dụng và chọn "Cập nhật trạng thái". |
| **Tiền điều kiện** | Đối tác vận chuyển đã đăng nhập vào hệ thống với tài khoản được phân quyền. Đơn vận chuyển tồn tại và đang ở trạng thái "Đang vận chuyển". Đối tác vận chuyển là người được giao phụ trách đơn vận chuyển đó. |
| **Hậu điều kiện** | Bản ghi trạng thái mới (vị trí, nhiệt độ, tình trạng, thời gian) được lưu vào hệ thống. Hành trình vận chuyển của lô hàng được cập nhật thêm điểm mới. Audit log ghi nhận: "Cập nhật trạng thái tại \[vị trí\] bởi \[user\] lúc \[thời gian\]" — không thể xóa hoặc sửa. |
| **Luồng sự kiện chính** | Đối tác vận chuyển đăng nhập và chọn đơn vận chuyển đang phụ trách. Hệ thống hiển thị thông tin đơn và nút "Cập nhật trạng thái". Đối tác vận chuyển nhấn "Cập nhật trạng thái tại trạm". Hệ thống hiển thị form cập nhật: vị trí (tự động lấy GPS hoặc nhập tay), tình trạng lô hàng (Bình thường / Cảnh báo / Hỏng), ghi chú. Đối tác vận chuyển điền thông tin và nhấn "Xác nhận". Hệ thống xác thực dữ liệu. Hệ thống lưu bản ghi trạng thái và ghi audit log append-only. Hệ thống hiển thị xác nhận "Cập nhật trạng thái thành công". |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có |

## **UC22: Cập nhật thông tin vận chuyển**

| Tên Use-case | Cập nhật thông tin vận chuyển |
| :---: | :---- |
| **Mã Use-case** | UC22 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Đối tác vận chuyển |
| **Mô tả** | Cho phép Đối tác vận chuyển thay đổi thông tin biển số xe hoặc tài xế phụ trách trước khi xe khởi hành. Mọi thay đổi đều được ghi vào audit log để truy vết. |
| **Sự kiện kích hoạt** | Đối tác vận chuyển cần thay đổi phương tiện hoặc nhân sự trước thời điểm khởi hành |
| **Tiền điều kiện** | Đối tác vận chuyển đã đăng nhập và có quyền chỉnh sửa đơn vận chuyển. Đơn vận chuyển tồn tại với trạng thái "Chờ khởi hành". Đơn vận chuyển thuộc phạm vi quản lý của đối tác vận chuyển đang đăng nhập. |
| **Hậu điều kiện** | Thông tin biển số xe hoặc tài xế được cập nhật thành công. Audit log ghi: "Cập nhật thông tin vận chuyển \[trường thay đổi\]: \[giá trị cũ\] → \[giá trị mới\] bởi \[user\] lúc \[thời gian\]" — append-only. Quản trị viên nhận thông báo về sự thay đổi. |
| **Luồng sự kiện chính** | Đối tác vận chuyển chọn đơn vận chuyển cần chỉnh sửa từ danh sách. Hệ thống hiển thị chi tiết đơn và nút "Chỉnh sửa thông tin". Đối tác vận chuyển nhấn "Chỉnh sửa thông tin". Hệ thống hiển thị form chỉnh sửa với các trường có thể thay đổi: biển số xe, họ tên tài xế, số điện thoại tài xế. Đối tác vận chuyển sửa thông tin cần thay đổi và nhập lý do thay đổi. Đối tác vận chuyển nhấn "Lưu thay đổi". Hệ thống xác thực định dạng biển số xe và thông tin tài xế. Hệ thống lưu thông tin mới và ghi audit log với giá trị cũ và mới. Hệ thống hiển thị xác nhận "Cập nhật thành công". |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | E1: Đơn vận chuyển đã chuyển sang trạng thái "Đang vận chuyển" — hệ thống vô hiệu hóa tính năng chỉnh sửa và hiển thị thông báo "Không thể chỉnh sửa sau khi xe đã khởi hành". E2: Biển số xe không đúng định dạng — hệ thống highlight trường và yêu cầu nhập lại. |

## **UC23: Xem hành trình vận chuyển**

| Tên Use-case | Xem hành trình vận chuyển |
| :---: | :---- |
| **Mã Use-case** | UC23 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Đối tác vận chuyển, Quản trị viên |
| **Mô tả** | Cho phép Đối tác vận chuyển và Quản trị viên theo dõi toàn bộ các điểm dừng đỗ và trạng thái vận chuyển của lô hàng theo trình tự thời gian, bao gồm vị trí, nhiệt độ và tình trạng tại mỗi trạm. |
| **Sự kiện kích hoạt** | Người dùng chọn "Xem hành trình" trên một đơn vận chuyển cụ thể. |
| **Tiền điều kiện** | Người dùng đã đăng nhập với quyền xem đơn vận chuyển tương ứng. Đơn vận chuyển tồn tại trong hệ thống. |
| **Hậu điều kiện** | Toàn bộ lịch sử các điểm dừng của đơn vận chuyển được hiển thị đầy đủ (chỉ đọc, không chỉnh sửa). |
| **Luồng sự kiện chính** | Người dùng tìm kiếm và chọn đơn vận chuyển cần xem. Hệ thống hiển thị trang chi tiết đơn vận chuyển. Người dùng chọn tab/nút "Xem hành trình". Hệ thống truy vấn tất cả bản ghi cập nhật trạng thái của đơn này, sắp xếp theo thứ tự thời gian tăng dần. Hệ thống hiển thị danh sách các điểm dừng dạng timeline: thứ tự, thời gian, vị trí, nhiệt độ, tình trạng, người cập nhật.  Người dùng có thể nhấn vào từng điểm để xem chi tiết. |
| **Luồng sự kiện phụ** | 3a. Hệ thống hiển thị bản đồ với các điểm dừng được đánh dấu theo trình tự. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | E1: Chưa có bản ghi cập nhật nào — hệ thống hiển thị "Chưa có thông tin cập nhật hành trình". |

## **UC24: Xác nhận nhận hàng**

| Tên Use-case | Xác nhận nhận hàng |
| :---: | :---- |
| **Mã Use-case** | UC24 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Cửa hàng |
| **Mô tả** | Cho phép nhân viên Cửa hàng chốt thao tác nhận lô hàng thành công từ đơn vị vận chuyển, ghi nhận thời điểm nhận và chuyển lô hàng sang trạng thái "Đã nhận" để đưa vào phân phối. |
| **Sự kiện kích hoạt** | Xe giao hàng đến cửa hàng; nhân viên cửa hàng kiểm tra và xác nhận hàng đã giao đủ, đúng chất lượng. |
| **Tiền điều kiện** | Nhân viên cửa hàng đã đăng nhập vào hệ thống. Đơn vận chuyển cho lô hàng tồn tại và đang ở trạng thái "Đang vận chuyển". Cửa hàng đang đăng nhập là cửa hàng đích được ghi trên đơn vận chuyển. |
| **Hậu điều kiện** | Trạng thái đơn vận chuyển chuyển sang "Đã giao". Trạng thái lô hàng chuyển sang "Đã nhận tại cửa hàng". Audit log ghi: "Xác nhận nhận hàng lô \[ID\] tại cửa hàng \[ID\] bởi \[user\] lúc \[thời gian\]". Quản trị viên và Đối tác vận chuyển nhận thông báo giao hàng thành công. |
| **Luồng sự kiện chính** | Nhân viên cửa hàng đăng nhập và vào mục "Đơn hàng chờ nhận". Hệ thống hiển thị danh sách lô hàng đang trên đường đến cửa hàng. Nhân viên cửa hàng chọn lô hàng vừa được giao và nhấn "Xác nhận nhận hàng". Hệ thống hiển thị thông tin lô hàng (ID, số lượng, loại hàng) để nhân viên đối chiếu thực tế. Nhân viên cửa hàng xác nhận số lượng thực nhận và nhấn "Hoàn tất nhận hàng". Hệ thống cập nhật trạng thái và ghi audit log. Hệ thống hiển thị thông báo xác nhận và mã QR tóm tắt lô hàng. |
| **Luồng sự kiện phụ** | 2a. Nhân viên quét mã QR trên lô hàng để tự động điền thông tin thay vì tìm kiếm thủ công. 5a. Nhân viên thêm ghi chú khi nhận (ví dụ: "Hàng đến muộn 2 giờ"). |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | E1: Số lượng thực nhận khác số lượng trên đơn — hệ thống yêu cầu nhân viên xác nhận lại hoặc chuyển sang UC25 (Báo cáo lỗi lô hàng). E2: Lô hàng không tìm thấy trong hệ thống (mã QR không hợp lệ) — hệ thống hiển thị lỗi và yêu cầu liên hệ Quản trị viên. |

## **UC25: Báo cáo lỗi lô hàng**

| Tên Use-case | Báo cáo lỗi lô hàng |
| :---: | :---- |
| **Mã Use-case** | UC25 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Cửa hàng |
| **Mô tả** | Cho phép nhân viên Cửa hàng ghi nhận và gửi báo cáo khi phát hiện lô hàng bị hỏng hóc, thiếu hụt về số lượng hoặc không đạt tiêu chuẩn chất lượng so với thông tin ban đầu trên đơn vận chuyển. |
| **Sự kiện kích hoạt** | Nhân viên cửa hàng phát hiện sự bất thường khi kiểm tra lô hàng trong quá trình nhận hàng (UC24) hoặc sau khi nhận. |
| **Tiền điều kiện** | Nhân viên cửa hàng đã đăng nhập vào hệ thống. Lô hàng tồn tại trong hệ thống và liên quan đến cửa hàng đang đăng nhập. Lô hàng ở trạng thái "Đang vận chuyển" hoặc "Đã nhận tại cửa hàng". |
| **Hậu điều kiện** | Báo cáo lỗi được lưu với đầy đủ thông tin (loại lỗi, mô tả, bằng chứng). Trạng thái lô hàng chuyển sang "Có khiếu nại". Audit log ghi: "Báo cáo lỗi lô hàng \[ID\]: \[loại lỗi\] bởi \[user\] lúc \[thời gian\]". Quản trị viên và Đối tác vận chuyển nhận thông báo khẩn về báo cáo lỗi. |
| **Luồng sự kiện chính** | Nhân viên cửa hàng chọn lô hàng có vấn đề và nhấn "Báo cáo lỗi". Hệ thống hiển thị form báo cáo lỗi với các trường: loại lỗi (Hỏng hóc / Thiếu hụt / Không đúng chủng loại / Khác), số lượng bị lỗi, mô tả chi tiết, bằng chứng (ảnh chụp). Nhân viên cửa hàng chọn loại lỗi và điền mô tả chi tiết. Nhân viên cửa hàng nhấn "Gửi báo cáo". Hệ thống xác thực dữ liệu (loại lỗi và mô tả là bắt buộc). Hệ thống lưu báo cáo, cập nhật trạng thái lô hàng và ghi audit log. Hệ thống gửi thông báo đến Quản trị viên và Đối tác vận chuyển. Hệ thống hiển thị xác nhận "Báo cáo lỗi đã được ghi nhận. Mã báo cáo: \[ID\]". |
| **Luồng sự kiện phụ** | 2a. Nhân viên chọn "Nhận một phần" — hệ thống ghi nhận số lượng hợp lệ và tự động tạo báo cáo lỗi cho phần thiếu. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | E1: Thiếu trường bắt buộc (loại lỗi, mô tả) — hệ thống highlight và yêu cầu điền đầy đủ. |

# **GÓI 5: Quản lý Audit Log**

## **UC26: Quản lý Audit Log**

| Tên Use-case | Quản lý Audit Log |
| :---: | :---- |
| **Mã Use-case** | UC26 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên  |
| **Mô tả** | Cho phép Quản trị viên truy cập tổng quan module Audit Log, xem thống kê nhật ký hệ thống và điều hướng đến các chức năng tra cứu chi tiết. Module này là append-only: không có chức năng xóa hoặc sửa bất kỳ bản ghi nào. |
| **Sự kiện kích hoạt** | Quản trị viên chọn menu "Audit Log" trên hệ thống. |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập với quyền truy cập Audit Log (quyền chỉ đọc đặc biệt). |
| **Hậu điều kiện** | Quản trị viên xem được tổng quan thống kê nhật ký (số lượng bản ghi, phân loại theo loại sự kiện) và điều hướng đến UC27 hoặc UC28. |
| **Luồng sự kiện chính** | Quản trị viên chọn menu "Audit Log". Hệ thống hiển thị trang tổng quan với: tổng số bản ghi audit log, biểu đồ hoạt động theo ngày/tuần, top 5 loại sự kiện nhiều nhất. Quản trị viên xem tổng quan và chọn chức năng: Xem lịch sử thay đổi lô hàng (UC27) hoặc Tra cứu Audit Log (UC28). Hệ thống điều hướng đến chức năng tương ứng. |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | E1: Không có bản ghi audit log nào — hệ thống hiển thị "Hệ thống chưa có nhật ký". |

## **UC27: Xem lịch sử thay đổi lô hàng**

| Tên Use-case | Xem lịch sử thay đổi lô hàng |
| :---: | :---- |
| **Mã Use-case** | UC27 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Cho phép Quản trị viên xem toàn bộ nhật ký hệ thống (log hệ thống) liên quan đến một lô hàng cụ thể theo trình tự thời gian, bao gồm mọi thay đổi trạng thái, cập nhật thông tin và hành động của tất cả các bên liên quan. |
| **Sự kiện kích hoạt** | Quản trị viên chọn "Xem lịch sử thay đổi" cho một lô hàng cụ thể từ module Audit Log (UC26) hoặc từ màn hình chi tiết lô hàng. |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập và có quyền xem Audit Log. Lô hàng với ID tương ứng tồn tại trong hệ thống. |
| **Hậu điều kiện** | Toàn bộ lịch sử thay đổi của lô hàng được hiển thị dạng timeline theo thứ tự thời gian. |
| **Luồng sự kiện chính** | Quản trị viên nhập ID lô hàng cần tra cứu hoặc chọn từ danh sách. Hệ thống truy vấn tất cả bản ghi audit log có liên quan đến ID lô hàng này. Hệ thống hiển thị timeline các sự kiện theo thứ tự thời gian tăng dần: thời gian, loại sự kiện, giá trị cũ → giá trị mới, người thực hiện, địa chỉ IP. Quản trị viên đọc từng bản ghi để truy vết quá trình thay đổi. Quản trị viên nhấn vào bản ghi để xem chi tiết đầy đủ (payload JSON của log). |
| **Luồng sự kiện phụ** | 3a.  Quản trị viên lọc theo khoảng thời gian, loại sự kiện hoặc người thực hiện. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | E1: ID lô hàng không tồn tại — hệ thống hiển thị thông báo "Không tìm thấy lô hàng". |

## **UC28: Tra cứu Audit Log**

| Tên Use-case | Tra cứu Audit Log |
| :---: | :---- |
| **Mã Use-case** | UC28 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Cho phép Quản trị viên tìm kiếm và lọc toàn bộ nhật ký lưu vết bất biến của hệ thống theo nhiều tiêu chí (thời gian, người dùng, loại sự kiện, ID đối tượng) nhằm đảm bảo tính minh bạch và kiểm toán. Audit log chỉ append — không có chức năng xóa hoặc sửa. |
| **Sự kiện kích hoạt** | Quản trị viên cần kiểm tra một sự kiện bất thường hoặc thực hiện kiểm toán định kỳ; chọn "Tra cứu Audit Log" từ module UC26. |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập với quyền truy cập Audit Log. Hệ thống audit log đang hoạt động và có bản ghi. |
| **Hậu điều kiện** | Danh sách bản ghi audit log khớp với tiêu chí tra cứu được hiển thị (chỉ đọc). Hành động tra cứu của Quản trị viên cũng được ghi vào audit log: "Tra cứu audit log với tiêu chí \[X\] bởi \[user\] lúc \[thời gian\]". |
| **Luồng sự kiện chính** | Quản trị viên truy cập trang "Tra cứu Audit Log". Hệ thống hiển thị form tra cứu với các bộ lọc: khoảng thời gian (từ ngày – đến ngày), loại sự kiện (tạo / cập nhật / xóa / đăng nhập / truy cập), người thực hiện (tên hoặc ID), đối tượng (ID lô hàng / ID đơn vận chuyển / ID người dùng), địa chỉ IP. Quản trị viên nhập một hoặc nhiều tiêu chí tìm kiếm. Quản trị viên nhấn "Tra cứu". Hệ thống truy vấn cơ sở dữ liệu audit log và trả về kết quả phân trang. Hệ thống hiển thị danh sách bản ghi: thời gian, loại sự kiện, đối tượng bị tác động, người thực hiện, IP, trạng thái (thành công/thất bại). Quản trị viên chọn từng bản ghi để xem chi tiết payload đầy đủ. Hệ thống ghi log hành động tra cứu của quản trị viên vào audit log. |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | E1: Không có bản ghi nào khớp tiêu chí — hệ thống hiển thị "Không tìm thấy kết quả. Vui lòng thử lại với tiêu chí khác." |
