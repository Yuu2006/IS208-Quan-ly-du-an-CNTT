# **DANH SÁCH USE CASE**

| Mã UC | Tên Use case | Mô tả Use case |
| :---: | ----- | ----- |
| **GÓI 7: Quản lý mã QR định danh** |  |  |
| **UC32** | Quản lý mã QR định danh | Cho phép người dùng có thẩm quyền tạo mới, in ấn, tải xuống mã QR định danh duy nhất để gắn lên bao bì sản phẩm, đồng thời điều phối chức năng quét mã để truy xuất thông tin. |
| **UC33** | Tạo mã QR |  Cho phép người dùng bấm tạo mã QR định danh cho lô hàng. |
| **UC34** | Quét mã QR truy xuất | Người dùng sử dụng thiết bị cá nhân để quét QR để xem lại toàn bộ quá trình sản xuất của lô hàng. |
| **UC35** | In/ Tải xuống mã QR | Cho phép người dùng tải file ảnh mã QR hoặc in trực tiếp ra máy in tem nhãn để dán lên bao bì thực tế của lô hàng. |
| **GÓI 8: Quản lý hồ sơ Đối tác** |  |  |
| **UC36** | Quản lý hồ sơ đối tác | Cho phép Quản trị viên quản lý xuyên suốt vòng đời hồ sơ đối tác bao gồm thêm mới, cập nhật, tra cứu và khóa/xóa hồ sơ khi có biến động về hợp tác. |
| **UC37** | Thêm mới hồ sơ đối tác | Cho phép Quản trị viên khởi tạo hồ sơ cho một đối tác mới bằng cách lựa chọn loại hình và nhập các thông tin đặc thù tương ứng vào biểu mẫu của hệ thống. |
| **UC38** | Cập nhật hồ sơ đối tác | Cho phép Đại diện đối tác cập nhật thông tin hồ sơ và gửi yêu cầu chờ duyệt, đồng thời cho phép Quản trị viên trực tiếp chỉnh sửa hoặc phê duyệt các yêu cầu thay đổi này. |
| **UC39** | Tra cứu thông tin hồ sơ | Cho phép Quản trị viên và người dùng có thẩm quyền tìm kiếm, lọc danh sách theo tiêu chí và xem chi tiết hồ sơ năng lực của các đối tác trong hệ thống. |
| **UC40** | Xóa/Khóa hồ sơ đối tác | Cho phép Quản trị viên xóa hồ sơ đối tác (nếu chưa có giao dịch) hoặc vô hiệu hóa/khóa hồ sơ (nếu đã có lịch sử giao dịch) khi chấm dứt hợp tác. |

## ***UC32: Quản lý mã QR định danh***

| Tên Use-case | Quản lý mã QR định danh |
| :---: | :---- |
| **Mã Use-case** | UC32 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên, Nông trại, Khách hàng |
| **Mô tả** | Cho phép người dùng có thẩm quyền tạo mới, in ấn, tải xuống mã QR định danh duy nhất để gắn lên bao bì sản phẩm, đồng thời điều phối chức năng quét mã để truy xuất thông tin. |
| **Sự kiện kích hoạt** | Người dùng có nhu cầu thực hiện các thao tác liên quan đến mã QR (như tạo mã cho lô hàng mới, tải/in mã) hoặc người dùng mở chức năng quét mã trên thiết bị. |
| **Tiền điều kiện** | \- Đối với chức năng tạo, in, tải mã QR: Người dùng đã đăng nhập thành công vào hệ thống. Lô hàng tương ứng đã tồn tại trong hệ thống và được cấp ID duy nhất. \- Đối với chức năng quét mã QR: Thiết bị của người dùng có kết nối internet và trình duyệt/ứng dụng hỗ trợ camera, không yêu cầu phải đăng nhập. |
| **Hậu điều kiện** | \- Người dùng được điều hướng đến các chức năng cụ thể tương ứng với lựa chọn. \- Trạng thái hệ thống và dữ liệu không thay đổi cho đến khi các Use case con được thực thi. |
| **Luồng sự kiện chính** | Người dùng truy cập vào phân hệ quản lý mã QR trên hệ thống hoặc mở module quét QR. Hệ thống kiểm tra quyền hạn của người dùng và hiển thị các tùy chọn thao tác phù hợp. Người dùng lựa chọn một trong các thao tác sau: Nếu nhấn chọn "Tạo mã QR", hệ thống chuyển sang UC33: Tạo mã QR. Nếu mở camera để quét, hệ thống chuyển sang UC34: Quét mã QR truy xuất. Nếu nhấn chọn "In/Tải xuống", hệ thống chuyển sang UC35: In/ Tải xuống mã QR. Kết thúc Use case. |
| **Luồng sự kiện phụ** | Không có. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có. |

## ***UC33: Tạo mã QR***

| Tên Use-case | Tạo mã QR |
| :---: | :---- |
| **Mã Use-case** | UC33 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Nông trại, Quản trị viên |
| **Mô tả** | Cho phép người dùng khởi tạo mã QR định danh duy nhất cho một lô hàng đã được lưu trong hệ thống.  |
| **Sự kiện kích hoạt** | Người dùng chọn một lô hàng cụ thể chưa có mã QR và nhấn nút "Tạo mã QR" trên giao diện quản lý lô hàng. |
| **Tiền điều kiện** | \- Người dùng đã đăng nhập thành công vào hệ thống và được phân quyền thao tác trên lô hàng đó. \- Lô hàng đã tồn tại trong CSDL, được cấp ID duy nhất và không ở trạng thái "Đã hủy". |
| **Hậu điều kiện** | \- Mã QR được sinh ra, lưu trữ và liên kết thành công với ID của lô hàng trong cơ sở dữ liệu. \- Hệ thống ghi nhận hành động vào audit log. \- Giao diện hiển thị mã QR sẵn sàng để quét thử hoặc in ấn. |
| **Luồng sự kiện chính** | Người dùng truy cập vào danh sách lô hàng (UC12) hoặc màn hình chi tiết lô hàng (UC13). Người dùng chọn lô hàng cần tạo mã và nhấn nút "Tạo mã QR". Hệ thống tiếp nhận yêu cầu, kiểm tra ID lô hàng và xác nhận lô hàng này chưa có mã QR. Hệ thống sử dụng thuật toán để sinh ra một mã QR duy nhất chứa đường dẫn truy xuất nguồn gốc tương ứng với ID lô hàng. Hệ thống lưu trữ dữ liệu mã QR (file ảnh hoặc chuỗi mã hóa) và liên kết với bản ghi lô hàng trong CSDL. Hệ thống tự động ghi nhận hành động tạo mã QR vào audit log. Hệ thống hiển thị thông báo "Tạo mã QR thành công" và hiển thị hình ảnh mã QR vừa tạo trên màn hình. Kết thúc Use case. |
| **Luồng sự kiện phụ** | 3a. Lô hàng đã được tạo mã QR trước đó: \- Hệ thống nhận diện lô hàng đã có QR liên kết. \- Hệ thống không sinh mã mới mà hiển thị thông báo kèm theo hình ảnh mã QR hiện tại. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 3b. Lô hàng ở trạng thái không hợp lệ: ví dụ: Đã hủy \- Hệ thống chặn thao tác, hiển thị cảnh báo. Hủy bỏ yêu cầu. 4a. Lỗi hệ thống khi sinh/lưu mã QR: \- Quá trình tạo hoặc lưu mã QR bị gián đoạn do lỗi máy chủ/CSDL. Hệ thống hiển thị thông báo và không ghi nhận dữ liệu sai lệch. |

## ***UC34: Quét mã QR truy xuất***

| Tên Use-case | Quét mã QR truy xuất |
| :---: | :---- |
| **Mã Use-case** | UC34 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Khách hàng, Quản trị viên, Cửa hàng, Nông trại |
| **Mô tả** | Cho phép người dùng sử dụng thiết bị di động quét mã QR dán trên bao bì sản phẩm để truy xuất toàn bộ thông tin nguồn gốc, chứng chỉ và hành trình chuỗi cung ứng của lô hàng. |
| **Sự kiện kích hoạt** | Người dùng mở tính năng quét mã QR của hệ thống để quét mã QR dán trên sản phẩm. |
| **Tiền điều kiện** | \- Thiết bị của người dùng có kết nối Internet và camera hoạt động bình thường. \- Mã QR trên sản phẩm phải rõ nét, hợp lệ và được sinh ra bởi hệ thống BlueFood. \- Khách hàng không cần đăng nhập để thực hiện chức năng này. |
| **Hậu điều kiện** | \- Hiển thị thành công toàn bộ thông tin minh bạch của lô hàng cho người dùng. \- Hệ thống ghi nhận thêm 1 lượt quét cho lô hàng đó vào cơ sở dữ liệu. |
| **Luồng sự kiện chính** | Người dùng mở tính năng "Quét mã QR". Người dùng hướng camera vào mã QR được dán trên bao bì lô hàng. Hệ thống nhận diện, giải mã QR và trích xuất đường dẫn URL chứa ID lô hàng. Hệ thống tự động gửi yêu cầu truy vấn thông tin lô hàng lên máy chủ dựa trên ID vừa giải mã. Máy chủ kiểm tra ID, trích xuất dữ liệu lô hàng từ CSDL. Hệ thống tự động cập nhật tăng biến đếm số lượt quét QR của lô hàng đó (phục vụ thống kê). Hệ thống chuyển hướng và hiển thị giao diện truy xuất trực quan cho người dùng. Kết thúc Use case. |
| **Luồng sự kiện phụ** | 1a. Nhập mã ID thủ công (Fallback):   \- Nếu không thể quét QR, người dùng chọn tính năng "Nhập mã lô hàng".   \- Người dùng nhập ID in dưới mã QR vào ô tìm kiếm và nhấn "Truy xuất".   \- Hệ thống bỏ qua bước 2 và 3, tiếp tục thực thi từ bước 4 của luồng chính. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 3a. Không nhận diện được mã QR do bị rách, mờ, hỏng hoặc môi trường thiếu sáng.   \- Hệ thống không phản hồi, người dùng phải quét lại hoặc chuyển sang luồng phụ 1a (Nhập mã thủ công). 5a. Mã QR/ID lô hàng không tồn tại:   \- Hệ thống hiển thị thông báo cảnh báo. |

## ***UC35: In/ Tải xuống mã QR***

| Tên Use-case | In/ Tải xuống mã QR |
| :---: | :---- |
| **Mã Use-case** | UC35 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Nông trại, Quản trị viên |
| **Mô tả** | Cho phép người dùng tải tệp tin hình ảnh của mã QR định danh hoặc in trực tiếp ra máy in tem nhãn để tiến hành dán lên bao bì thực tế của lô hàng trước khi đưa vào vận chuyển, phân phối. |
| **Sự kiện kích hoạt** | Người dùng nhấn nút "Tải xuống" hoặc "In mã QR" tại màn hình quản lý QR hoặc màn hình chi tiết lô hàng. |
| **Tiền điều kiện** | \- Người dùng đã đăng nhập thành công vào hệ thống với vai trò có quyền thao tác trên lô hàng. \- Lô hàng đã tồn tại và đã được khởi tạo mã QR thành công. |
| **Hậu điều kiện** | \- Tệp hình ảnh mã QR được tải về thiết bị lưu trữ, hoặc lệnh in tem nhãn được gửi thành công tới máy in. \- Hành động in/tải xuống được ghi nhận vào hệ thống audit log. |
| **Luồng sự kiện chính** | Người dùng truy cập vào màn hình chi tiết lô hàng. Hệ thống hiển thị mã QR của lô hàng cùng các chức năng thao tác: "Tải xuống" và "In mã QR". Người dùng lựa chọn thao tác mong muốn: Nếu chọn "Tải xuống": Hệ thống đóng gói mã QR kèm các thông tin cơ bản (Mã lô ID, Tên sản phẩm) thành tệp tin định dạng PNG/JPG/PDF và tự động tải về thiết bị của người dùng. \- Nếu chọn "In mã QR": Hệ thống tạo bản xem trước (print preview) theo định dạng kích thước tem nhãn chuẩn và gọi hộp thoại in của trình duyệt/hệ điều hành. Người dùng cấu hình máy in và xác nhận lệnh in. Hệ thống ghi nhận hành động cùng thông tin người thực hiện, thời gian vào audit log. Hệ thống hiển thị thông báo thao tác thành công. Kết thúc Use case. |
| **Luồng sự kiện phụ** | Không có |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 2a. Lô hàng chưa có mã QR:   \- Trạng thái lô hàng chưa được cấp mã QR. Hệ thống không hiển thị nút "Tải xuống" và "In mã QR", thay vào đó hiển thị thông báo kèm theo nút "Tạo mã QR" (điều hướng sang UC33). |

## ***UC36: Quản lý hồ sơ đối tác***

| Tên Use-case | Quản lý hồ sơ đối tác |
| :---: | :---- |
| **Mã Use-case** | UC36 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Gói chức năng tổng quát điều phối toàn bộ nghiệp vụ quản lý thông tin hồ sơ của các bên tham gia chuỗi cung ứng (Nông trại, Đơn vị vận chuyển, Cửa hàng). Đây là use case bao quát, điều phối các use case con (UC37 → UC40). |
| **Sự kiện kích hoạt** | Quản trị viên có nhu cầu thực hiện bất kỳ thao tác nào liên quan đến quản lý hồ sơ của các đối tác (thêm mới, sửa, xem, xóa/khóa). |
| **Tiền điều kiện** | \- Quản trị viên đã đăng nhập thành công vào hệ thống. \- Quản trị viên được cấp quyền truy cập module quản lý hồ sơ đối tác. |
| **Hậu điều kiện** | \- Tùy theo thao tác cụ thể được chọn, hệ thống sẽ điều hướng và hiển thị chức năng tương ứng. \- Không làm thay đổi dữ liệu nghiệp vụ cho đến khi các Use case con được thực thi hoàn tất. |
| **Luồng sự kiện chính** | Quản trị viên truy cập vào phân hệ “Quản lý đối tác" trên hệ thống. Hệ thống hiển thị giao diện tổng quan danh sách hồ sơ đối tác hiện có và các công cụ thao tác. Quản trị viên lựa chọn một trong các thao tác sau: Nếu chọn "Thêm đối tác mới" → hệ thống chuyển sang UC37: Thêm mới hồ sơ đối tác. Nếu chọn "Sửa thông tin/Cập nhật" → hệ thống chuyển sang UC38: Cập nhật hồ sơ đối tác. Nếu chọn "Tìm kiếm/Xem chi tiết" → hệ thống chuyển sang UC39: Tra cứu thông tin hồ sơ. Nếu chọn "Xóa/Khóa" → hệ thống chuyển sang UC40: Xóa/Khóa hồ sơ đối tác. Kết thúc Use case. |
| **Luồng sự kiện phụ** | Không có. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có. |

## 

## ***UC37: Thêm mới hồ sơ đối tác***

| Tên Use-case | Thêm mới hồ sơ đối tác |
| :---: | :---- |
| **Mã Use-case** | UC37 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Cho phép Quản trị viên khởi tạo hồ sơ cho một đối tác mới tham gia vào chuỗi cung ứng (Nông trại, Đơn vị vận chuyển, hoặc Cửa hàng bán lẻ) bằng cách lựa chọn loại hình và nhập các thông tin đặc thù tương ứng. |
| **Sự kiện kích hoạt** | Quản trị viên nhấn nút "Thêm đối tác mới" tại giao diện Quản lý hồ sơ đối tác. |
| **Tiền điều kiện** | \- Quản trị viên đã đăng nhập thành công vào hệ thống. \- Quản trị viên được phân quyền thực hiện chức năng thêm mới đối tác. |
| **Hậu điều kiện** | \- Một bản ghi hồ sơ đối tác mới được lưu vào cơ sở dữ liệu với ID duy nhất và trạng thái "Đang hoạt động". \- Hệ thống ghi nhận hành động thêm mới đối tác vào audit log. \- Đối tác mới này sẵn sàng để được chọn trong các quy trình nghiệp vụ. |
| **Luồng sự kiện chính** | Quản trị viên nhấn nút "Thêm đối tác mới". Hệ thống hiển thị biểu mẫu thêm mới, yêu cầu chọn "Loại đối tác" (Nông trại, Vận chuyển, Cửa hàng). Quản trị viên chọn loại hình đối tác tương ứng. Hệ thống hiển thị các trường thông tin động phù hợp với loại đối tác đã chọn (Thông tin chung: Tên đối tác, Mã số thuế/CCCD, Người đại diện, SĐT, Email, Địa chỉ. Thông tin riêng: Nông trại cần diện tích canh tác; Vận chuyển cần loại phương tiện...). Quản trị viên nhập đầy đủ thông tin vào các trường bắt buộc. Quản trị viên nhấn nút "Lưu". Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào (định dạng) và kiểm tra trùng lặp (Mã số thuế, Email). Hệ thống lưu bản ghi hồ sơ đối tác vào cơ sở dữ liệu và cấp ID định danh duy nhất. Hệ thống tự động ghi nhận vào audit log. Hệ thống hiển thị thông báo và làm mới danh sách hiển thị. Kết thúc Use case. |
| **Luồng sự kiện phụ** | 10a. Tạo tài khoản đăng nhập cho đối tác:   \- Sau khi thêm hồ sơ thành công, hệ thống hiển thị gợi ý tạo tài khoản.   \- Nếu Quản trị viên chọn "Đồng ý", hệ thống chuyển tiếp sang UC04 (Thêm tài khoản) với các thông tin (Tên, Email, SĐT, Vai trò) được tự động điền sẵn từ hồ sơ vừa tạo. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 7a. Thiếu thông tin bắt buộc hoặc sai định dạng:   \- Hệ thống đánh dấu các trường bị lỗi/thiếu và hiển thị thông báo cảnh báo bên dưới từng trường. Quá trình lưu bị chặn lại cho đến khi dữ liệu hợp lệ. 7b. Trùng lặp dữ liệu quan trọng:   \- Nếu Email hoặc Mã số thuế đã tồn tại trong hệ thống, hệ thống từ chối lưu và hiển thị thông báo lỗi. |

## ***UC38: Cập nhật hồ sơ đối tác***

| Tên Use-case | Cập nhật hồ sơ đối tác |
| :---: | :---- |
| **Mã Use-case** | UC38 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Quản trị viên, Đối tác (Nông trại, Đơn vị vận chuyển, Cửa hàng) |
| **Mô tả** | Cho phép Đại diện đối tác cập nhật thông tin hồ sơ của đơn vị mình và gửi yêu cầu chờ duyệt. Đồng thời, cho phép Quản trị viên trực tiếp chỉnh sửa thông tin hoặc phê duyệt/từ chối các yêu cầu thay đổi từ phía đối tác. |
| **Sự kiện kích hoạt** | Người dùng chọn một hồ sơ đối tác hiện có và nhấn nút "Cập nhật". |
| **Tiền điều kiện** | \- Người dùng đã đăng nhập thành công vào hệ thống. \- Hồ sơ đối tác cần cập nhật đã tồn tại trong hệ thống. \- Đối tác chỉ được phép yêu cầu cập nhật hồ sơ của chính mình; Quản trị viên có quyền cập nhật toàn bộ hồ sơ. |
| **Hậu điều kiện** | \- Thông tin hồ sơ đối tác được cập nhật vào CSDL (đối với Quản trị viên) hoặc được lưu ở trạng thái chờ duyệt (đối với Đối tác). \- Hệ thống ghi nhận bản ghi vào audit log mô tả rõ trường dữ liệu bị tác động nếu cập nhật thành công. |
| **Luồng sự kiện chính** | Người dùng truy cập vào màn hình "Quản lý đối tác" (với Quản trị viên) hoặc "Hồ sơ của tôi" (với Đối tác). Người dùng nhấn nút "Cập nhật" tại hồ sơ tương ứng. Hệ thống hiển thị biểu mẫu với toàn bộ thông tin hiện tại của đối tác. Người dùng chỉnh sửa các trường thông tin cần thiết. Người dùng nhấn nút "Lưu thay đổi". Hệ thống kiểm tra tính hợp lệ của dữ liệu (định dạng, không để trống trường bắt buộc). Hệ thống xác định vai trò của người dùng thực hiện thao tác: Người dùng là Quản trị viên thì hệ thống cập nhật trực tiếp dữ liệu mới vào CSDL. Hệ thống tự động ghi nhận vào audit log. Hệ thống hiển thị thông báo và làm mới giao diện. Kết thúc Use case. |
| **Luồng sự kiện phụ** | 7a. Người dùng thực hiện là Đối tác (Luồng yêu cầu phê duyệt):   \- Tại bước 7, hệ thống xác định người dùng là Đối tác. Hệ thống không ghi đè dữ liệu ngay mà tạo một "Yêu cầu thay đổi thông tin" với trạng thái "Chờ duyệt".   \- Hệ thống gửi thông báo đến Quản trị viên.   \- Quản trị viên truy cập mục "Yêu cầu cập nhật", xem xét đối chiếu thông tin.   \- Nếu Quản trị viên nhấn "Phê duyệt": Hệ thống áp dụng thay đổi vào CSDL, ghi audit log và thông báo cho Đối tác.   \- Nếu Quản trị viên nhấn "Từ chối": Hệ thống hủy yêu cầu, ghi nhận lý do từ chối và thông báo lại cho Đối tác. Kết thúc Use case. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 6a. Dữ liệu nhập không hợp lệ hoặc thiếu trường bắt buộc:   \- Hệ thống đánh dấu các trường bị lỗi và hiển thị thông báo yêu cầu người dùng kiểm tra lại định dạng. 6b. Trùng lặp thông tin định danh:   \- Nếu Quản trị viên/Đối tác sửa Mã số thuế hoặc Email trùng với một đối tác khác đang hoạt động, hệ thống từ chối lưu và báo lỗi. |

## ***UC39: Tra cứu thông tin hồ sơ***

| Tên Use-case | Tra cứu thông tin hồ sơ |
| :---: | :---- |
| **Mã Use-case** | UC39 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Quản trị viên, Người dùng có thẩm quyền (Nông trại, Vận chuyển, Cửa hàng) |
| **Mô tả** | Cho phép Quản trị viên và người dùng có thẩm quyền tìm kiếm, lọc danh sách theo các tiêu chí và xem thông tin chi tiết của các đối tác tham gia trong chuỗi cung ứng. |
| **Sự kiện kích hoạt** | Người dùng truy cập vào module "Quản lý đối tác" và sử dụng thanh tìm kiếm, bộ lọc hoặc nhấn chọn "Xem chi tiết" trên một hồ sơ cụ thể. |
| **Tiền điều kiện** | \- Người dùng đã đăng nhập thành công vào hệ thống. \- Người dùng được phân quyền xem danh sách và chi tiết hồ sơ đối tác (Quản trị viên được xem toàn bộ; Đối tác thường chỉ được xem hồ sơ của chính mình hoặc các đối tác có liên kết trong chuỗi). |
| **Hậu điều kiện** | \- Hệ thống hiển thị danh sách hồ sơ đối tác phù hợp với tiêu chí tìm kiếm hoặc hiển thị thông tin chi tiết của một đối tác cụ thể. \- Quá trình tra cứu không làm thay đổi hay ảnh hưởng đến bất kỳ dữ liệu nghiệp vụ nào trong cơ sở dữ liệu. |
| **Luồng sự kiện chính** | Người dùng truy cập vào màn hình "Quản lý đối tác" (với Quản trị viên) hoặc "Hồ sơ của tôi" (với Đối tác). Hệ thống hiển thị danh sách hồ sơ đối tác mặc định và các công cụ tìm kiếm, bộ lọc. Người dùng nhập từ khóa tìm kiếm hoặc chọn tiêu chí lọc. Người dùng nhấn nút "Tìm kiếm" hoặc áp dụng bộ lọc. Hệ thống tiếp nhận yêu cầu, truy vấn cơ sở dữ liệu và trả về danh sách hồ sơ khớp với tiêu chí. Người dùng nhấn chọn nút "Xem chi tiết" tại một bản ghi hồ sơ cụ thể trong danh sách. Hệ thống hiển thị màn hình chi tiết hồ sơ với đầy đủ thông tin: Thông tin định danh, Thông tin liên hệ, Loại hình đối tác, Lịch sử hoạt động/giao dịch liên quan. Kết thúc Use case. |
| **Luồng sự kiện phụ** | 5a. Không tìm thấy kết quả phù hợp:   \- Nếu từ khóa hoặc bộ lọc không khớp với bất kỳ hồ sơ nào trong CSDL, hệ thống hiển thị danh sách trống kèm theo thông báo. Người dùng có thể xóa bộ lọc hoặc đổi từ khóa để tìm lại (Quay về bước 3). |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có. |

## ***UC40: Xóa/Khóa hồ sơ đối tác***

| Tên Use-case | Xóa/Khóa hồ sơ đối tác |
| :---: | :---- |
| **Mã Use-case** | UC40 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Cho phép Quản trị viên xóa hồ sơ đối tác (chỉ áp dụng nếu đơn vị này chưa có bất kỳ giao dịch/lô hàng nào trong hệ thống) hoặc vô hiệu hóa/khóa hồ sơ (nếu đã có lịch sử giao dịch) khi chấm dứt hợp tác. |
| **Sự kiện kích hoạt** | Quản trị viên chọn một hồ sơ đối tác từ danh sách (UC39) và nhấn nút "Xóa/Khóa". |
| **Tiền điều kiện** | \- Quản trị viên đã đăng nhập thành công vào hệ thống. \- Hồ sơ đối tác cần thao tác đang tồn tại ở trạng thái hoạt động. |
| **Hậu điều kiện** | \- Hồ sơ đối tác bị xóa vĩnh viễn khỏi cơ sở dữ liệu HOẶC được chuyển sang trạng thái "Bị khóa" (Tùy thuộc vào điều kiện lịch sử). \- Toàn bộ tài khoản đăng nhập liên kết với đối tác này sẽ tự động bị vô hiệu hóa (Liên kết với UC07). \- Hành động được ghi nhận đầy đủ vào hệ thống audit log. |
| **Luồng sự kiện chính** | Quản trị viên tìm kiếm và chọn hồ sơ đối tác cần xử lý từ danh sách. Quản trị viên nhấn nút "Xóa/Khóa". Hệ thống kiểm tra ràng buộc dữ liệu bằng cách đối chiếu ID đối tác với các bảng dữ liệu nghiệp vụ. Hệ thống xác định đối tác đã có lịch sử tham gia chuỗi cung ứng. Hệ thống hiển thị hộp thoại kèm theo ô nhập lý do. Quản trị viên nhập lý do chấm dứt hợp tác và xác nhận "Đồng ý". Hệ thống cập nhật trạng thái hồ sơ đối tác thành "Bị khóa". Hệ thống tự động vô hiệu hóa quyền truy cập của các tài khoản người dùng thuộc đối tác này. Hệ thống ghi nhận vào audit log. Hệ thống thông báo và làm mới danh sách hiển thị. Kết thúc Use case. |
| **Luồng sự kiện phụ** | 4a. Đối tác chưa có dữ liệu giao dịch (Thực hiện Xóa vật lý):   \- Tại bước 3, hệ thống xác định đối tác hoàn toàn mới, chưa tham gia bất kỳ nghiệp vụ nào.   \- Hệ thống hiển thị hộp thoại xác nhận.   \- Quản trị viên xác nhận "Đồng ý".   \- Hệ thống thực hiện xóa vật lý bản ghi hồ sơ đối tác và tài khoản liên kết khỏi CSDL.   \- Hệ thống ghi log thao tác xóa và chuyển tới Bước 9\. 5a. Quản trị viên hủy thao tác:   \- Tại các hộp thoại xác nhận, Quản trị viên chọn "Hủy bỏ". Hệ thống đóng hộp thoại, giữ nguyên trạng thái dữ liệu và kết thúc Use case. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 3a. Đối tác đang có giao dịch chưa hoàn tất:   \- Tại bước 3, hệ thống phát hiện đối tác đang tham gia vào các lô hàng có trạng thái "Đang chuẩn bị", "Đang vận chuyển", hoặc đơn vận chuyển chưa hoàn tất.   \- Hệ thống chặn thao tác và hiển thị cảnh báo.   \- Hủy bỏ thao tác, kết thúc Use case. |
