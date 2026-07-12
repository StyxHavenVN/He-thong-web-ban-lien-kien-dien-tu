# Web bán linh kiện điện tử

Ứng dụng prototype/MVP cho đồ án Thiết kế và Kiến trúc phần mềm theo C4 Model.

## 1. Kiến trúc sử dụng

Nhóm lựa chọn kiến trúc:

- Client-Server
- Layered Architecture
- Modular Monolith

### Client-Server

- `frontend/`: phía client, gồm giao diện HTML/CSS/JavaScript thuần.
- `backend/`: phía server, gồm Node.js + Express API xử lý nghiệp vụ.

### Layered Architecture

Trong mỗi module backend, mã nguồn được chia theo các lớp:

```text
routes      -> định nghĩa endpoint
controller  -> tiếp nhận request/response
service     -> xử lý nghiệp vụ
repository  -> truy xuất dữ liệu
```

### Modular Monolith

Backend vẫn là một ứng dụng Node.js duy nhất, nhưng bên trong chia thành các module nghiệp vụ:

```text
backend/src/modules/
├── auth/
├── product/
├── cart/
├── order/
├── payment/
├── shipping/
├── notification/
├── report/
└── admin/
```

## 2. Công nghệ

- Backend: Node.js, Express
- Frontend: HTML/CSS/JavaScript thuần
- Database prototype: JSON file `backend/src/data/db.json`
- Deployment giả lập: Docker, Docker Compose
- Reverse proxy frontend: Nginx

## 3. Cấu trúc thư mục

```text
web-linh-kien-app/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── product/
│       │   ├── cart/
│       │   ├── order/
│       │   ├── payment/
│       │   ├── shipping/
│       │   ├── notification/
│       │   ├── report/
│       │   └── admin/
│       ├── middleware/
│       ├── repositories/
│       ├── data/
│       ├── utils/
│       └── server.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    ├── login.html
    ├── register.html
    ├── cart.html
    ├── orders.html
    ├── admin.html
    └── assets/
        ├── css/
        └── js/
```

## 4. Chạy bằng Docker Compose

Yêu cầu máy đã cài Docker Desktop.

```bash
docker compose up --build
```

Mở trình duyệt:

```text
http://localhost:8080
```

Backend API health check:

```text
http://localhost:3000/api/health
```

Dừng hệ thống:

```bash
docker compose down
```

## 5. Chạy backend không dùng Docker

```bash
cd backend
npm install
npm start
```

Mở trình duyệt:

```text
http://localhost:3000
```

## 6. Tài khoản mẫu

```text
Khách hàng: customer@shop.local / 123456
Quản trị viên: admin@shop.local / 123456
Nhân viên kho: staff@shop.local / 123456
```

## 7. Chức năng prototype

- Đăng ký, đăng nhập, phân quyền cơ bản
- Xem danh sách sản phẩm
- Tìm kiếm và lọc sản phẩm
- Xem gợi ý linh kiện tương thích
- Quản lý giỏ hàng
- Đặt hàng
- Thanh toán trong service
- Giao hàng trong service
- Gửi thông báo trong service
- Quản trị sản phẩm, khách hàng, đơn hàng và doanh thu

## 8. Ghi chú triển khai

- `frontend` chạy bằng Nginx tại cổng 8080.
- `backend` chạy bằng Node.js tại cổng 3000.
- Frontend gọi API qua đường dẫn `/api`, Nginx sẽ proxy request sang backend.
- Dữ liệu prototype được lưu tại `backend/src/data/db.json` và được mount vào container backend để dữ liệu không mất khi restart container.
