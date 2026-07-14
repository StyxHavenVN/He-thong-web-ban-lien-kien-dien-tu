# Bảng Theo Dõi Yêu Cầu (Requirement Traceability Matrix)

Bảng này dùng để đối chiếu các chức năng từ FR01 đến FR17 với các file tương ứng trong dự án để đảm bảo không bị thiếu sót và dễ dàng theo dõi tiến trình qua từng đợt phát triển.

| Mã Yêu Cầu | Tên Yêu Cầu | Trạng Thái | File Backend Liên Quan | File Frontend Liên Quan | Ghi Chú / Đợt Triển Khai |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR01** | Đăng ký tài khoản | Chờ hoàn thiện | `auth.service.js`, `auth.controller.js`, `auth.routes.js`, `user.model.js` | `register.html`, `auth.js` | Triển khai ở **Đợt 2** |
| **FR02** | Đăng nhập | Chờ hoàn thiện | `auth.service.js`, `auth.controller.js`, `auth.routes.js`, `user.model.js` | `login.html`, `auth.js` | Triển khai ở **Đợt 2** |
| **FR03** | Xem danh sách sản phẩm | Chờ hoàn thiện | `product.service.js`, `product.controller.js`, `product.routes.js`, `product.model.js` | `index.html`, `products.js` | Triển khai ở **Đợt 3** |
| **FR04** | Tìm kiếm và lọc sản phẩm | Chờ hoàn thiện | `product.service.js`, `product.controller.js`, `product.routes.js` | `products.html`, `products.js` | Triển khai ở **Đợt 3** |
| **FR05** | Xem chi tiết sản phẩm | Chờ hoàn thiện | `product.service.js`, `product.controller.js`, `product.routes.js` | `product-detail.html` (chưa tạo), `product-detail.js` | Triển khai ở **Đợt 3** |
| **FR06** | Quản lý giỏ hàng | Sử dụng db.json | `cart.service.js`, `cart.controller.js`, `cart.routes.js` | `cart.html`, `cart.js` | Chuyển sang PostgreSQL ở **Đợt 5** |
| **FR07** | Đặt hàng | Sử dụng db.json | `order.service.js`, `order.controller.js`, `order.routes.js` | `cart.html`, `cart.js` | Chuyển sang PostgreSQL ở **Đợt 6** |
| **FR08** | Xem lịch sử đơn hàng | Sử dụng db.json | `order.service.js`, `order.controller.js`, `order.routes.js` | `orders.html`, `orders.js` | Chuyển sang PostgreSQL ở **Đợt 6** |
| **FR09** | Quản lý sản phẩm | Chờ hoàn thiện | `admin.controller.js`, `product.model.js` | `admin.html`, `admin.js` | Triển khai ở **Đợt 4** |
| **FR10** | Quản lý danh mục | Chờ hoàn thiện | `admin.controller.js`, `category.model.js` (chưa tạo) | `admin.html`, `admin.js` | Triển khai ở **Đợt 4** (Chuẩn bị DB ở Đợt 1) |
| **FR11** | Quản lý đơn hàng | Sử dụng db.json | `order.service.js`, `admin.controller.js` | `admin.html`, `admin.js` | Hoàn thiện ở các đợt sau |
| **FR12** | Quản lý khách hàng | Sử dụng db.json | `admin.controller.js` | `admin.html`, `admin.js` | Hoàn thiện ở các đợt sau |
| **FR13** | Thống kê doanh thu | Sử dụng db.json | `report.service.js`, `admin.controller.js` | `admin.html`, `admin.js` | Hoàn thiện ở các đợt sau |
| **FR14** | Thanh toán trực tuyến mô phỏng | Chưa làm | `payment.service.js` | Giao diện thanh toán | Triển khai ở các đợt sau |
| **FR15** | Giao hàng và vận đơn mô phỏng | Chưa làm | `shipping.service.js` | Giao diện vận đơn | Triển khai ở các đợt sau |
| **FR16** | Email/SMS mô phỏng | Chưa làm | `notification.service.js` | | Triển khai ở các đợt sau |
| **FR17** | Gợi ý linh kiện tương thích | Chưa làm | `recommendation.service.js` | | Triển khai ở các đợt sau |
