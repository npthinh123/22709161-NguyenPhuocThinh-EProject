
## Giới thiệu
Dự án phục vụ cho việc học về kiến trúc microservices, sử dụng RabbitMQ làm message broker và API Gateway để định tuyến request.
Được cung cấp bởi ThS. Huỳnh Nam.

## Công nghệ sử dụng
- Node.js
- Express.js
- MongoDB
- RabbitMQ (AMQP)
- API Gateway

## Kiến trúc tổng quan
### Microservices
- **Authentication Service**: Xác thực và phân quyền người dùng, bảo mật hệ thống.
- **Product Service**: Quản lý sản phẩm, cung cấp các API CRUD cho sản phẩm.
- **Order Service**: Quản lý đơn hàng, xử lý tạo đơn hàng và giao tiếp với Product Service.
- **API Gateway**: Định tuyến request từ client đến các microservice phù hợp, xử lý xác thực, phân quyền, chuyển đổi request/response.

### RabbitMQ (AMQP)
- **Push-based**: Một bên cung cấp (Producer), một bên tiêu thụ (Consumer).
- **Event-driven**: Hỗ trợ tốt cho kiến trúc hướng sự kiện, giúp các service giao tiếp bất đồng bộ.
- **Queue**: Tin nhắn được lưu trữ theo FIFO, đảm bảo không mất dữ liệu khi service tạm thời ngừng hoạt động.

## Quy trình giao tiếp giữa các service
**Đặt hàng:**
Người dùng gửi yêu cầu đặt hàng qua API Gateway đến Product Service. Product Service xuất bản chi tiết đơn hàng vào Product Queue của RabbitMQ.

**Xử lý đơn hàng:**
Order Service lắng nghe Product Queue, nhận thông tin đơn hàng, kiểm tra sản phẩm và giá, sau đó tạo đơn hàng mới trong Orders DB.

**Xác nhận đơn hàng:**
Sau khi đơn hàng được tạo, Order Service xuất bản thông tin sản phẩm liên quan vào Products Queue để xác minh đơn hàng thành công.

**Xuất hóa đơn:**
Product Service lắng nghe Products Queue, nhận thông tin và tiến hành xuất hóa đơn cho người dùng.

## Clean Architecture
Mỗi microservice có cấu trúc như sau:
- **Models**: Định nghĩa cấu trúc dữ liệu.
- **Repositories**: Xử lý truy cập CSDL, thực hiện CRUD.
- **Services**: Thực hiện nghiệp vụ của service.
- **Controllers**: Tiếp nhận, xử lý, điều hướng request từ bên ngoài.
- **Middlewares**: Xử lý trung gian cho request/response (ví dụ: xác thực).

## Thành phần RabbitMQ
- **Producer**: Gửi tin nhắn vào queue.
- **Consumer**: Nhận tin nhắn từ queue theo cơ chế push-based.

## API Gateway
Định tuyến request từ client đến các microservice.
Xử lý xác thực, phân quyền, chuyển đổi request/response, giới hạn dung lượng, caching.

## Hướng dẫn chạy dự án
### Cài đặt các service:
Vào từng thư mục microservice (`auth`, `product`, `order`, `api-gateway`) và chạy:
```sh
npm install
```

### Cài đặt RabbitMQ:
Cài RabbitMQ trên máy hoặc chạy bằng Docker.
Đảm bảo RabbitMQ chạy ở `amqp://localhost:5672`.

### Khởi động các service:
Mở 4 terminal, chạy từng service:
```sh
npm start
# hoặc
node index.js
```
cho từng service.

### Truy cập API Gateway:
Gửi request qua API Gateway tại http://localhost:3003.

### Kiểm tra RabbitMQ:
Truy cập giao diện quản lý RabbitMQ tại http://localhost:15672 (user/pass: guest/guest).

## Tham khảo code xử lý RabbitMQ
Xem chi tiết trong file `product/src/controllers/productController.js`.

## Lưu ý
Dự án này chỉ phục vụ mục đích học tập, không dùng cho sản xuất thực tế.

Nguyễn Phước Thịnh

