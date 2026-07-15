# BlueTech - Web bán linh kiện điện tử

Ứng dụng hoàn chỉnh cho đồ án Thiết kế và Kiến trúc phần mềm, giữ đúng pattern trong bản thiết kế:

- Client–Server
- Layered Architecture
- Modular Monolith
- Repository Pattern
- External Service Adapter mô phỏng thanh toán, giao hàng và thông báo

## Kiến trúc

```text
frontend HTML/CSS/JavaScript
            │ HTTP/JSON
            ▼
Express Route → Controller → Service → Repository → Sequelize → PostgreSQL
                                │
                                ├── Payment Adapter (mock)
                                ├── Shipping Adapter (mock)
                                └── Notification Adapter (mock)
```

Backend là một tiến trình Node.js duy nhất nhưng được chia theo module nghiệp vụ:

```text
backend/src/modules/
├── auth/
├── product/
├── category/
├── cart/
├── order/
├── payment/
├── shipping/
├── notification/
├── report/
└── admin/
```

Quy tắc phụ thuộc:

```text
route → controller → service → repository → model/database
```

Controller không truy cập Sequelize. Service không xử lý `req`/`res`. Repository là tầng truy cập dữ liệu.

## Chạy bằng Docker Compose

Yêu cầu: Docker Desktop hoặc Docker Engine có Compose.

```bash
docker compose up --build
```

Mở:

- Website: http://localhost:8080
- API health check: http://localhost:3000/api/health

Dừng hệ thống:

```bash
docker compose down
```

Xóa cả dữ liệu PostgreSQL để chạy lại từ đầu:

```bash
docker compose down -v
```

## Chạy backend không dùng Docker

Yêu cầu Node.js 20+ và PostgreSQL đang chạy.

```bash
cd backend
npm install
```

Sao chép `.env.example` thành `.env` hoặc khai báo các biến tương đương, sau đó:

```bash
npm start
```

Frontend tĩnh nên chạy qua Nginx/Docker để `/api` được proxy đúng sang backend.

## Tài khoản mẫu

Mật khẩu chung: `123456`

- Khách hàng: `customer@shop.local`
- Nhân viên: `staff@shop.local`
- Quản trị viên: `admin@shop.local`

## Chức năng

- FR01–FR02: đăng ký, đăng nhập, JWT, khóa tạm khi nhập sai 5 lần
- FR03–FR05: danh mục, tìm kiếm/lọc/sắp xếp, chi tiết và tương thích linh kiện
- FR06–FR08: giỏ hàng, đặt hàng, thanh toán/vận chuyển mô phỏng, lịch sử đơn
- FR09–FR13: quản lý sản phẩm, danh mục, đơn hàng, khách hàng và doanh thu
- FR14–FR16: adapter thanh toán, giao hàng và thông báo mô phỏng
- FR17: kiểm tra tương thích theo socket, RAM và công suất nguồn

Doanh thu chỉ tính các đơn có trạng thái `COMPLETED`.

## Kiểm thử kiến trúc

```bash
cd backend
npm test
```

Chi tiết cấu trúc và trách nhiệm từng tầng xem tại [ARCHITECTURE.md](ARCHITECTURE.md).
