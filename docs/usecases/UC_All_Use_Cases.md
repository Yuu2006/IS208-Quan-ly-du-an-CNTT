# **DANH SÁCH USE CASE**

| Mã UC | Tên Use case | Mô tả Use case |
| :---: | ----- | ----- |
| **GÓI 1: Quản lý tài khoản** |  |  |
| **UC01** | Quản lý tài khoản | Gói chức năng tổng hợp cho phép quản trị viên thêm tài khoản, Phân quyền người dùng, khóa/ vô hiệu hóa tài khoản |
| **UC02** | Đăng nhập | Cho phép người dùng xác thực thông tin tài khoản hợp lệ để truy cập vào hệ thống. |
| **UC03** | Đăng xuất | Thoát tài khoản người dùng khỏi hệ thống |
| **UC04** | Thêm tài khoản | Quản trị viên tạo mới tài khoản cho nhân viên, nông trại, đơn vị vận chuyển hoặc cửa hàng tham gia chuỗi cung ứng. |
| **UC05** | Cập nhật thông tin tài khoản | Người dùng cập nhật lại các thông tin cá nhân, liên hệ của tài khoản hiện tại. |
| **UC06** | Phân quyền người dùng | Quản trị viên phân quyền truy cập cho các tài khoản người dùng khác |
| **UC07** | Thay đổi trạng thái tài khoản | Quản trị viên vô hiệu hóa tài khoản của các đối tác không còn hợp tác để đảm bảo bảo mật. |
| **GÓI 2: Quản lý lô hàng** |  |  |
| **UC08** | Quản lý lô hàng | Use case tổng quát bao gồm toàn bộ các chức năng nghiệp vụ liên quan đến quản lý lô hàng trong hệ thống, đây là use case bao quát, điều phối các use case con (UC09 → UC13) |
| **UC09** | Thêm lô hàng mới | Nông trại khởi tạo dữ liệu cho một lô hàng nông sản mới ngay sau khi thu hoạch. |
| **UC10** | Cập nhật thông tin lô hàng | Nông trại cập nhật lại sai sót về số lượng hoặc loại nông sản trước khi lô hàng xuất kho. |
| **UC11** | Hủy/ Xóa lô hàng | Nông trại hủy bỏ lô hàng vừa tạo trên hệ thống nếu phát hiện lỗi nghiêm trọng chưa xuất kho hoặc chưa có vận chuyển. |
| **UC12** | Xem danh sách lô hàng | Các bên tham gia truy cập để xem danh sách các lô hàng đang thuộc quyền quản lý của mình. |
| **UC13** | Tra cứu thông tin lô hàng | Cho phép người dùng tìm kiếm lô hàng theo mã lô, tên sản phẩm, nhà cung cấp, trạng thái hoặc khoảng thời gian; xem chi tiết lô hàng bao gồm thông tin sản phẩm, trạng thái hiện tại và các dữ liệu liên quan.  |
| **GÓI 3: Quản lý chứng chỉ** |  |  |
| **UC14** | Quản lý chứng chỉ | Gói chức năng tổng hợp cho phép nông trại tải lên, cập nhật, xóa và tra cứu chứng chỉ chất lượng liên quan đến lô hàng.  |
| **UC15** | Tải chứng chỉ | Nông trại tải lên các tài liệu, hình ảnh chứng minh chất lượng (VietGAP, GlobalGAP) cho lô hàng. |
| **UC16** | Cập nhật thông tin chứng chỉ | Nông trại cập nhật hoặc thay thế file chứng chỉ nếu phát hiện tải lên nhầm tài liệu trước đó. |
| **UC17** | Xóa chứng chỉ | Nông trại gỡ bỏ những chứng chỉ không hợp lệ khỏi lô hàng trước khi lô hàng được vận chuyển. |
| **UC18** | Tra cứu chứng chỉ | Cho phép người dùng xem danh sách chứng chỉ của một lô hàng và kiểm tra tình trạng hiệu lực.  |
| **GÓI 4: Quản lý vận chuyển** |  |  |
| **UC19** | Quản lý vận chuyển | Cho phép Quản trị viên xem tổng quan toàn bộ đơn vận chuyển trong hệ thống, bao gồm tạo mới, theo dõi trạng thái và điều phối các đơn vị vận chuyển. |
| **UC20** | Tạo đơn vận chuyển lô hàng | Cho phép Quản trị viên tạo một đơn vận chuyển mới để giao lô hàng từ kho BlueFood đến cửa hàng đích, bao gồm việc chỉ định đối tác vận chuyển, tài xế và phương tiện. |
| **UC21** | Cập nhật trạng thái vận chuyển | Đối tác vận chuyển cập nhật vị trí, nhiệt độ và tình trạng lô hàng tại các trạm kiểm soát |
| **UC22** | Cập nhật thông tin vận chuyển | Đối tác vận chuyển thay đổi thông tin về biển số xe hoặc tài xế phụ trách trước khi xe khởi hành. |
| **UC23** | Xem hành trình vận chuyển | Đối tác vận chuyển và quản trị viên theo dõi lại toàn bộ các điểm dừng đỗ của chuyến xe. (trạng thái vận chuyển của lô h |
| **UC24** | Xác nhận nhận hàng | Cửa hàng chốt thao tác nhận lô hàng thành công từ đơn vị vận chuyển để đưa vào phân phối. |
| **UC25** | Báo cáo lỗi lô hàng | Cửa hàng ghi nhận tình trạng hàng hóa bị hỏng hóc hoặc thiếu hụt so với thông tin ban đầu. |
| **GÓI 5: Quản lý Audit Log** |  |  |
| **UC26** | Quản lý Audit Log | Cho phép Quản trị viên truy cập tổng quan module Audit Log, xem thống kê nhật ký hệ thống và điều hướng đến các chức năng tra cứu chi tiết. Module này là append-only: không có chức năng xóa hoặc sửa bất kỳ bản ghi nào. |
| **UC27** | Xem lịch sử thay đổi lô hàng | Cho phép Quản trị viên xem toàn bộ nhật ký hệ thống (log hệ thống) liên quan đến một lô hàng cụ thể theo trình tự thời gian, bao gồm mọi thay đổi trạng thái, cập nhật thông tin và hành động của tất cả các bên liên quan. |
| **UC28** | Tra cứu Audit Log | Quản trị viên kiểm tra hệ thống nhật ký lưu vết bất biến (chỉ thêm, không xóa/sửa) để đảm bảo tính minh bạch |
| **GÓI 6: Quản lý lịch sử chuỗi cung ứng** |  |  |
| **UC29** | Quản lý lịch sử chuỗi cung ứng | Use case tổng quát bao gồm toàn bộ các chức năng liên quan đến quản lý lịch sử chuỗi cung ứng trong hệ thống, đây là use case bao quát, điều phối các use case con (UC30 → UC31). |
| **UC30** | Xem nguồn gốc lô hàng | Cho phép người dùng xem thông tin nguồn gốc ban đầu của lô hàng: nông trại, ngày thu hoạch, địa điểm, phương thức canh tác.  |
| **UC31** | Xem lịch sử chuỗi cung ứng | Cho phép xem toàn bộ hành trình của lô hàng từ nông trại đến cửa hàng, bao gồm: nguồn gốc, chứng chỉ, vận chuyển, xác nhận nhận hàng và các thay đổi liên quan.  |
| **GÓI 7: Quản lý mã QR định danh** |  |  |
| **UC32** | Quản lý mã QR định danh | Cho phép người dùng có thẩm quyền tạo mới, in ấn, tải xuống mã QR định danh duy nhất để gắn lên bao bì sản phẩm, đồng thời điều phối chức năng quét mã để truy xuất thông tin. |
| **UC33** | Tạo mã QR | Cho phép người dùng bấm tạo mã QR định danh cho lô hàng. |
| **UC34** | Quét mã QR truy xuất | Người dùng sử dụng thiết bị cá nhân để quét QR để xem lại toàn bộ quá trình sản xuất của lô hàng. |
| **UC35** | In/ Tải xuống mã QR | Cho phép người dùng tải file ảnh mã QR hoặc in trực tiếp ra máy in tem nhãn để dán lên bao bì thực tế của lô hàng. |
| **GÓI 8: Quản lý hồ sơ Đối tác** |  |  |
| **UC36** | Quản lý hồ sơ đối tác | Cho phép Quản trị viên quản lý xuyên suốt vòng đời hồ sơ đối tác bao gồm thêm mới, cập nhật, tra cứu và khóa/xóa hồ sơ khi có biến động về hợp tác. |
| **UC37** | Thêm mới hồ sơ đối tác | Cho phép Quản trị viên khởi tạo hồ sơ cho một đối tác mới (nông trại, đơn vị vận chuyển hoặc cửa hàng bán lẻ) bằng cách lựa chọn loại hình và nhập các thông tin đặc thù tương ứng vào biểu mẫu của hệ thống. |
| **UC38** | Cập nhật hồ sơ đối tác | Cho phép Đại diện đối tác cập nhật thông tin hồ sơ và gửi yêu cầu chờ duyệt, đồng thời cho phép Quản trị viên trực tiếp chỉnh sửa hoặc phê duyệt các yêu cầu thay đổi này. |
| **UC39** | Tra cứu thông tin hồ sơ | Cho phép Quản trị viên và người dùng có thẩm quyền tìm kiếm, lọc danh sách theo tiêu chí và xem chi tiết hồ sơ năng lực của các đối tác trong hệ thống. |
| **UC40** | Xóa/Khóa hồ sơ đối tác | Cho phép Quản trị viên xóa hồ sơ đối tác (nếu chưa có giao dịch) hoặc vô hiệu hóa/khóa hồ sơ (nếu đã có lịch sử giao dịch) khi chấm dứt hợp tác. |
| **GÓI 9: Báo cáo và thống kê** |  |  |
| **UC41** | Quản lý báo cáo và thống kê | Gói chức năng tổng hợp cho phép quản trị viên thống kê lô hàng, xuất báo cáo, kiểm tra tồn kho và nhận cảnh báo hết hạn.  |
| **UC42** | Thống kê lô hàng | Cho phép quản trị viên thống kê số lượng lô hàng theo thời gian, trạng thái, nhà cung cấp, số lượng QR đã tạo, số lượt quét QR.  |
| **UC43** | Xuất báo cáo  | Cho phép xuất báo cáo thống kê ra định dạng PDF hoặc Excel để lưu trữ, gửi cho các bên liên quan.  |
| **UC44** | Kiểm tra tồn kho | Cho phép quản trị viên xem số lượng tồn kho hiện tại của từng lô hàng.  |
| **UC45** | Xem cảnh báo hết hạn | Cho phép quản trị viên xem danh sách các lô hàng sắp hết hạn sử dụng.  |