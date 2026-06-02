# GÓI 2: QUẢN LÝ LÔ HÀNG & GÓI 6: QUẢN LÝ LỊCH SỬ CHUỖI CUNG ỨNG

## **UC08: Quản lý lô hàng**

| Tên Use-case | Quản lý lô hàng |
| :---: | :---- |
| **Mã Use-case** | UC08  |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Nông trại, quản trị viên |
| **Mô tả** | Use case tổng quát bao gồm toàn bộ các chức năng nghiệp vụ liên quan đến quản lý lô hàng trong hệ thống, đây là use case bao quát, điều phối các use case con (UC09 → UC13). |
| **Sự kiện kích hoạt** | Người dùng có nhu cầu thực hiện bất kỳ thao tác quản lý nào đối với lô hàng (tạo, sửa, xem, tìm kiếm). |
| **Tiền điều kiện** | Người dùng đã đăng nhập thành công vào hệ thống. Người dùng có vai trò phù hợp. |
| **Hậu điều kiện** | Tùy theo thao tác cụ thể: lô hàng được tạo mới, cập nhật, xóa, hoặc thông tin được hiển thị theo yêu cầu. Mọi thay đổi dữ liệu quan trọng được ghi nhận vào audit log. |
| **Luồng sự kiện chính** | 1\. Người dùng truy cập vào màn hình "Quản lý lô hàng". 2\. Hệ thống hiển thị tổng quan các chức năng quản lý lô hàng theo phân quyền. 3\. Người dùng lựa chọn một trong các thao tác sau: Thêm lô hàng mới → chuyển sang UC09 Cập nhật thông tin lô hàng → chuyển sang UC10 Hủy / Xóa lô hàng → chuyển sang UC11 Xem danh sách lô hàng → chuyển sang UC12 Tra cứu thông tin lô hàng → chuyển sang UC13 4\. Hệ thống thực hiện chức năng tương ứng. 5\. Kết thúc usecase. |
| **Luồng sự kiện phụ** | Không có. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có. |

## **UC09: Thêm lô hàng mới**

| Tên Use-case | Thêm lô hàng mới |
| :---: | :---- |
| **Mã Use-case** | UC09 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Nông trại |
| **Mô tả** | Cho phép nông trại hoặc nhà cung cấp khởi tạo một lô hàng nông sản mới ngay sau khi thu hoạch hoặc đóng gói. Hệ thống tự động sinh mã định danh duy nhất cho lô hàng. |
| **Sự kiện kích hoạt** | Nông trại hoàn thành thu hoạch/đóng gói và cần đưa dữ liệu vào hệ thống để cấp mã định danh.  |
| **Tiền điều kiện** | Người dùng đã đăng nhập thành công vào hệ thống. Người dùng có quyền tạo lô hàng trong phân quyền hệ thống. |
| **Hậu điều kiện** | Một bản ghi lô hàng mới được tạo trong cơ sở dữ liệu với trạng thái "Đang chuẩn bị". Mã lô hàng duy nhất được sinh ra và gán cho lô hàng. Hệ thống ghi nhận một bản ghi audit log về hành động tạo lô hàng. |
| **Luồng sự kiện chính** | Người dùng truy cập vào màn hình "Quản lý lô hàng". Người dùng nhấn nút "Thêm lô hàng mới". Hệ thống hiển thị biểu mẫu nhập thông tin lô hàng (tên sản phẩm, loại thực phẩm, nguồn gốc, ngày thu hoạch, ngày đóng gói, số lượng, đơn vị tính, tiêu chuẩn áp dụng). Người dùng nhập đầy đủ thông tin bắt buộc. Người dùng nhấn nút "Lưu". Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào. Hệ thống sinh mã lô hàng duy nhất. Hệ thống lưu bản ghi lô hàng vào cơ sở dữ liệu. Hệ thống ghi nhận vào audit log. Hệ thống thông báo thành công và hiển thị lại danh sách lô hàng (UC12). Kết thúc usecase. |
| **Luồng sự kiện phụ** | 4a: Người dùng nhấn nút "Sao chép từ lô hàng trước". Hệ thống tự động điền thông tin từ lô hàng gần nhất, người dùng chỉ cần chỉnh sửa các trường cần thay đổi trước khi lưu. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 4a: Người dùng bỏ trống thông tin bắt buộc. Hệ thống hiển thị thông báo: "Vui lòng nhập đầy đủ thông tin bắt buộc".  6a: Người dùng nhập số lượng âm hoặc ngày thu hoạch lớn hơn ngày hiện tại. Hệ thống hiển thị thông báo: "Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại". |

## **UC10: Cập nhật thông tin lô hàng**

| Tên Use-case | Cập nhật thông tin lô hàng |
| :---: | :---- |
| **Mã Use-case** | UC10 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Nông trại  |
| **Mô tả** | Cho phép nông trại hoặc nhà cung cấp sửa đổi các thông tin của lô hàng đã tạo. Việc cập nhật chỉ được thực hiện trước khi lô hàng được xuất kho hoặc bàn giao cho vận chuyển. |
| **Sự kiện kích hoạt** | Nông trại phát hiện sai sót trong thông tin lô hàng hoặc cần bổ sung thông tin mới. |
| **Tiền điều kiện** | \- Người dùng đã đăng nhập với vai trò nông trại. \- Lô hàng cần cập nhật đã tồn tại trong hệ thống. \- Lô hàng chưa được xuất kho hoặc chưa bàn giao cho vận chuyển (trạng thái ≠ "Đang vận chuyển" và ≠ "Đã giao"). |
| **Hậu điều kiện** | \- Thông tin lô hàng được cập nhật trong cơ sở dữ liệu. \- Hệ thống ghi nhận một bản ghi audit log với nội dung thay đổi (giá trị cũ → giá trị mới). |
| **Luồng sự kiện chính** | 1\. Người dùng truy cập màn hình "Danh sách lô hàng". 2\. Người dùng tìm kiếm lô hàng cần sửa. 3\. Người dùng nhấn vào biểu tượng "Sửa" của lô hàng tương ứng. 4\. Hệ thống hiển thị biểu mẫu với các trường thông tin hiện tại của lô hàng. 5\. Người dùng chỉnh sửa các thông tin cần thay đổi. 6\. Người dùng nhấn nút "Lưu thay đổi". 7\. Hệ thống kiểm tra tính hợp lệ của dữ liệu mới. 8\. Hệ thống cập nhật bản ghi lô hàng trong cơ sở dữ liệu. 9\. Hệ thống ghi nhận vào audit log. 10\. Hệ thống thông báo "Cập nhật lô hàng thành công". 11\. Kết thúc usecase. |
| **Luồng sự kiện phụ** | Không có. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 3a: Lô hàng đã có trạng thái "Đang vận chuyển" hoặc "Đã giao". Hệ thống hiển thị thông báo: "Không thể cập nhật lô hàng đã được vận chuyển hoặc giao hàng". 5a: Người dùng nhập số lượng âm hoặc dữ liệu không hợp lệ. Hệ thống hiển thị thông báo: "Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại". |

## **UC11: Hủy / Xóa lô hàng**

| Tên Use-case | Hủy / Xóa lô hàng |
| :---: | :---- |
| **Mã Use-case** | UC11 |
| **Mức độ quan trọng** | Trung bình |
| **Tác nhân chính** | Nông trại |
| **Mô tả** | Cho phép nông trại hoặc nhà cung cấp hủy một lô hàng đã tạo. Hệ thống không xóa vật lý bản ghi lô hàng mà chỉ chuyển trạng thái thành "Đã hủy" để đảm bảo tính toàn vẹn của dữ liệu lịch sử và audit log.  |
| **Sự kiện kích hoạt** | Nông trại phát hiện lỗi nghiêm trọng về chất lượng hoặc quyết định không đưa lô hàng vào chuỗi cung ứng. |
| **Tiền điều kiện** | \- Người dùng đã đăng nhập với vai trò nông trại. \- Lô hàng cần xóa đã tồn tại trong hệ thống. \- Lô hàng chưa được xuất kho và chưa có đơn vận chuyển. |
| **Hậu điều kiện** | \- Lô hàng bị xóa vật lý hoặc được đánh dấu trạng thái "Đã hủy". \- Dữ liệu lô hàng vẫn được giữ nguyên trong cơ sở dữ liệu. \- Hệ thống ghi nhận một bản ghi audit log về hành động hủy lô hàng.  |
| **Luồng sự kiện chính** | 1\. Người dùng truy cập màn hình "Danh sách lô hàng". 2\. Người dùng tìm kiếm lô hàng cần hủy. 3\. Người dùng nhấn vào biểu tượng "Xóa" của lô hàng. 4\. Hệ thống hiển thị hộp thoại xác nhận: "Bạn có chắc chắn muốn hủy lô hàng \[mã lô\]? Hành động này không thể hoàn tác". 5\. Người dùng xác nhận "Đồng ý". 6\. Hệ thống kiểm tra điều kiện (chưa xuất kho, chưa có vận chuyển). 7\. Hệ thống thực hiện chuyển trạng thái “Đã hủy”. 8\. Hệ thống ghi nhận vào audit log. 9\. Hệ thống thông báo "Đã hủy lô hàng". 10\. Kết thúc usecase.  |
| **Luồng sự kiện phụ** | 3a: Người dùng chọn nhiều lô hàng cùng lúc và nhấn "Xóa hàng loạt". Hệ thống hiển thị danh sách các lô thỏa mãn điều kiện để người dùng xác nhận từng lô trước khi thực hiện. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 3a: Lô hàng đã có đơn vận chuyển hoặc đã xuất kho. Hệ thống hiển thị thông báo: "Lô hàng đã có hoạt động vận chuyển. Không thể xóa.” 4a: Người dùng chọn "Hủy bỏ" trong hộp thoại xác nhận. Hệ thống đóng hộp thoại, không thực hiện thay đổi. |

## **UC12: Xem danh sách lô hàng**

| Tên Use-case | Xem danh sách lô hàng |
| :---: | :---- |
| **Mã Use-case** | UC12 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên, nông trại, vận chuyển, cửa hàng |
| **Mô tả** | Cho phép các bên tham gia truy cập và xem danh sách các lô hàng mà họ có quyền quản lý. Quyền xem được phân tách theo vai trò. |
| **Sự kiện kích hoạt** | Người dùng đăng nhập và truy cập màn hình chính hoặc chọn menu "Quản lý lô hàng". |
| **Tiền điều kiện** | \- Người dùng đã đăng nhập thành công. \- Người dùng có vai trò phù hợp (quản trị viên, nông trại, vận chuyển, cửa hàng). |
| **Hậu điều kiện** | Hệ thống hiển thị danh sách lô hàng dạng bảng với các trường: mã lô, tên sản phẩm, ngày tạo, trạng thái, hành động. |
| **Luồng sự kiện chính** | 1\. Người dùng đăng nhập vào hệ thống. 2\. Hệ thống điều hướng đến bảng điều khiển hoặc người dùng nhấn menu "Quản lý lô hàng". 3\. Hệ thống xác định vai trò của người dùng. 4\. Hệ thống truy vấn danh sách lô hàng dựa trên vai trò (nông trại chỉ thấy lô của mình, vận chuyển thấy lô được giao, cửa hàng thấy lô đã giao đến, quản trị viên thấy tất cả). 5\. Hệ thống hiển thị danh sách dạng bảng (mã lô, tên sản phẩm, số lượng, ngày tạo, trạng thái, thao tác). 6\. Hệ thống hỗ trợ phân trang (mỗi trang 20-50 bản ghi). 7\. Kết thúc usecase.  |
| **Luồng sự kiện phụ** | 4a: Người dùng chọn bộ lọc trạng thái từ dropdown (Đang chuẩn bị, Đang vận chuyển, Đã giao, Đã hủy). Hệ thống chỉ hiển thị các lô hàng có trạng thái tương ứng. 5a: Người dùng nhấn vào mã lô hoặc nút "Xem chi tiết". Hệ thống chuyển sang UC13 (Tra cứu thông tin lô hàng). |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có. |

## **UC13: Tra cứu thông tin lô hàng**

| Tên Use-case | Tra cứu thông tin lô hàng |
| :---: | :---- |
| **Mã Use-case** | UC13 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên, nông trại, vận chuyển, cửa hàng |
| **Mô tả** | Cho phép người dùng tìm kiếm lô hàng theo nhiều tiêu chí và xem thông tin chi tiết của từng lô hàng, bao gồm thông tin sản phẩm, trạng thái, chứng chỉ, hành trình vận chuyển và lịch sử thay đổi. |
| **Sự kiện kích hoạt** | Người dùng cần tìm một lô hàng cụ thể hoặc xem thông tin đầy đủ của lô hàng từ danh sách. |
| **Tiền điều kiện** | \- Người dùng đã đăng nhập thành công. \- Người dùng có quyền truy cập vào lô hàng đó. |
| **Hậu điều kiện** | Hệ thống hiển thị chi tiết lô hàng (thông tin cơ bản, chứng chỉ, vận chuyển, lịch sử thay đổi). |
| **Luồng sự kiện chính** | 1\. Người dùng truy cập màn hình "Tra cứu lô hàng" hoặc từ danh sách nhấn "Xem chi tiết". 2\. Hệ thống hiển thị các trường tìm kiếm: Mã lô, tên sản phẩm, nhà cung cấp, trạng thái, khoảng thời gian. 3\. Người dùng nhập các tiêu chí tìm kiếm. 4\. Người dùng nhấn nút "Tìm kiếm". 5\. Hệ thống truy vấn cơ sở dữ liệu và hiển thị danh sách kết quả. 6\. Người dùng chọn một lô hàng và nhấn "Xem chi tiết". 7\. Hệ thống hiển thị giao diện chi tiết với các tab: Thông tin cơ bản, chứng chỉ, hành trình vận chuyển, lịch sử thay đổi. 8\. Kết thúc usecase. |
| **Luồng sự kiện phụ** | Không có. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 5a: Không tìm thấy lô hàng nào. Hệ thống hiển thị thông báo: "Không tìm thấy lô hàng nào. Vui lòng thay đổi tiêu chí tìm kiếm". |

## **UC29: Quản lý lịch sử chuỗi cung ứng**

| Tên Use-case | Quản lý lịch sử chuỗi cung ứng |
| :---: | :---- |
| **Mã Use-case** | UC29 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Quản trị viên |
| **Mô tả** | Use case tổng quát bao gồm toàn bộ các chức năng liên quan đến quản lý lịch sử chuỗi cung ứng trong hệ thống, đây là use case bao quát, điều phối các use case con (UC30 → UC31).  |
| **Sự kiện kích hoạt** | Quản trị viên có nhu cầu thực hiện bất kỳ thao tác nào liên quan đến xem hoặc kiểm tra lịch sử chuỗi cung ứng.  |
| **Tiền điều kiện** | \- Người dùng đã đăng nhập với vai trò quản trị viên. |
| **Hậu điều kiện** | \- Tùy theo thao tác cụ thể: thông tin nguồn gốc hoặc lịch sử chuỗi cung ứng được hiển thị theo yêu cầu.  |
| **Luồng sự kiện chính** | 1\. Quản trị viên truy cập menu "Quản lý chuỗi cung ứng". 2\. Hệ thống hiển thị tổng quan các chức năng quản lý chuỗi cung ứng theo phân quyền. 3\. Người dùng lựa chọn một trong các thao tác sau:   \- Xem nguồn gốc lô hàng → chuyển sang UC30   \- Xem lịch sử chuỗi cung ứng → chuyển sang UC31 4\. Hệ thống thực hiện chức năng tương ứng. 5\. Kết thúc usecase.  |
| **Luồng sự kiện phụ** | Không có. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | Không có.  |

## **UC30: Xem nguồn gốc lô hàng**

| Tên Use-case | Xem nguồn gốc lô hàng |
| :---: | :---- |
| **Mã Use-case** | UC30 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Khách hàng, quản trị viên, nông trại, cửa hàng |
| **Mô tả** | Cho phép người dùng xem thông tin nguồn gốc ban đầu của một lô hàng: nông trại, ngày thu hoạch, địa điểm canh tác, phương thức canh tác. |
| **Sự kiện kích hoạt** | Khách hàng quét mã QR trên sản phẩm và chọn tab "Nguồn gốc", hoặc người dùng nội bộ truy cập từ màn hình chi tiết lô hàng. |
| **Tiền điều kiện** | \- Đối với khách hàng: không cần đăng nhập, lô hàng được xác định qua mã QR. \- Lô hàng đã có dữ liệu nguồn gốc được nhập. |
| **Hậu điều kiện** | Hệ thống hiển thị thông tin nguồn gốc lô hàng một cách trực quan, dễ đọc. |
| **Luồng sự kiện chính** | 1\. Hệ thống nhận yêu cầu xem nguồn gốc của một lô hàng (từ mã QR hoặc từ chi tiết lô hàng). 2\. Hệ thống truy vấn dữ liệu lô hàng và nông trại liên kết. 3\. Hệ thống hiển thị thông tin nguồn gốc: Tên nông trại, địa chỉ, mã số chứng nhận, giống cây trồng/vật nuôi, phương thức canh tác, ngày thu hoạch, ngày đóng gói, số lượng. 4\. Hệ thống hiển thị các chứng chỉ liên quan dưới dạng biểu tượng có thể nhấn để xem chi tiết. 5\. Người dùng nhấn "Xem toàn bộ hành trình". Hệ thống chuyển sang UC31. 6\. Kết thúc usecase. |
| **Luồng sự kiện phụ** | 4a: Người dùng nhấn vào biểu tượng chứng chỉ. Hệ thống hiển thị chi tiết chứng chỉ (loại chứng chỉ, ngày cấp, ngày hết hạn, đơn vị cấp). |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 2a: Nông trại chưa nhập đầy đủ thông tin nguồn gốc. Hệ thống hiển thị thông báo: "Thông tin nguồn gốc đang được cập nhật". 1a: Mã QR không tồn tại. Hệ thống hiển thị thông báo: "Mã sản phẩm không hợp lệ".  |

## **UC31: Xem lịch sử chuỗi cung ứng**

| Tên Use-case | Xem lịch sử chuỗi cung ứng |
| :---: | :---- |
| **Mã Use-case** | UC31 |
| **Mức độ quan trọng** | Cao |
| **Tác nhân chính** | Khách hàng, quản trị viên, nông trại, vận chuyển, cửa hàng |
| **Mô tả** | Cho phép người dùng xem toàn bộ hành trình của một lô hàng từ nông trại đến cửa hàng dưới dạng dòng thời gian, bao gồm nguồn gốc, chứng chỉ, các mốc vận chuyển, xác nhận giao nhận và lịch sử thay đổi. |
| **Sự kiện kích hoạt** | Người dùng chọn "Xem toàn bộ hành trình" từ UC30 hoặc từ chi tiết lô hàng (UC13). |
| **Tiền điều kiện** | \- Đối với khách hàng: không cần đăng nhập, lô hàng được xác định qua mã QR. \- Lô hàng đã có ít nhất một mốc vận chuyển hoặc thay đổi trạng thái. |
| **Hậu điều kiện** | Hệ thống hiển thị toàn bộ dòng lịch sử của lô hàng theo thứ tự thời gian. |
| **Luồng sự kiện chính** | 1\. Hệ thống nhận yêu cầu xem lịch sử chuỗi cung ứng của một lô hàng. 2\. Hệ thống truy vấn dữ liệu từ bảng lô hàng, chứng chỉ, vận chuyển và audit log. 3\. Hệ thống sắp xếp dữ liệu theo thứ tự thời gian. 4\. Hệ thống hiển thị giao diện dạng timeline với các mốc: Khởi tạo lô hàng, chứng chỉ. vận chuyển (từng chặng), giao nhận, lịch sử thay đổi 5\. Hệ thống hiển thị trạng thái hiện tại của lô hàng. 6\. Người dùng cuộn hoặc nhấn vào từng mốc để xem chi tiết. 7\. Kết thúc usecase. |
| **Luồng sự kiện phụ** | Không có. |
| **Luồng sự kiện lỗi hoặc ngoại lệ** | 3a: Thiếu một số mốc bắt buộc. Hệ thống vẫn hiển thị các mốc có sẵn và đánh dấu cảnh báo: "Dữ liệu chưa đầy đủ \- đang chờ cập nhật". 3b: Lô hàng có trạng thái "Đã hủy". Hệ thống hiển thị timeline dừng tại thời điểm hủy và ghi rõ lý do (nếu có). |
