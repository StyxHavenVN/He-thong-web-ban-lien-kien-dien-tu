# Báo cáo Khảo sát Hiện trạng Hệ thống (Current State Audit)

Báo cáo này được thực hiện trong **Đợt 1** để kiểm tra tính đồng bộ giữa Frontend và Backend, xác định các module đang sử dụng Sequelize/PostgreSQL và JSON Database (`db.json`), tìm các route chưa được mount, và các điểm không đồng nhất về dữ liệu giữa client và server.

## 1. Bản đồ Lưu trữ Dữ liệu (Database Mapping)

Hiện tại, hệ thống đang dùng song song hai nguồn lưu trữ:
- **PostgreSQL (Sequelize):**
  - **Auth (User):** Model `User` trong [user.model.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/backend/src/modules/auth/user.model.js) lưu trữ bảng `users`.
  - **Product:** Model `Product` trong [product.model.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/backend/src/modules/product/product.model.js) lưu trữ bảng `products`.
- **JSON Database (db.json):**
  - **Cart:** Được quản lý qua `cart.service.js` đọc ghi trực tiếp bằng `jsonRepository.js`.
  - **Order:** Được quản lý qua `order.service.js` đọc ghi trực tiếp bằng `jsonRepository.js`.
  - **Admin:** Các thao tác thống kê và khóa user đọc ghi trực tiếp bằng `jsonRepository.js`.

---

## 2. Khảo sát các Endpoint mà Frontend đang gọi

Dưới đây là danh sách các endpoint mà các script Frontend đang gọi qua hàm `fetch`:

| Tên File JS Client | Endpoint Gọi | HTTP Method | Mục Đích | Trạng Thái Backend Hiện Tại |
| :--- | :--- | :--- | :--- | :--- |
| `auth.js` | `/api/auth/register` | `POST` | Đăng ký tài khoản | Đã có route và controller hoạt động |
| `auth.js` | `/api/auth/login` | `POST` | Đăng nhập hệ thống | Đã có route và controller hoạt động |
| `products.js` | `/api/products` | `GET` | Xem danh sách + Lọc sản phẩm | Đã có route và controller hoạt động |
| `cart.js` | `/api/cart` | `GET` | Lấy thông tin giỏ hàng | Route/Controller tồn tại nhưng chưa mount |
| `cart.js` | `/api/cart/items/:productId` | `PUT` | Cập nhật số lượng giỏ hàng | Route/Controller tồn tại nhưng chưa mount |
| `cart.js` | `/api/orders` | `POST` | Đặt hàng | Route/Controller tồn tại nhưng chưa mount |
| `orders.js` | `/api/orders/my` | `GET` | Xem lịch sử đơn hàng của mình | Route/Controller tồn tại nhưng chưa mount |
| `admin.js` | `/api/orders/admin/all` | `GET` | Xem danh sách đơn hàng cho Admin | Route/Controller tồn tại nhưng chưa mount |
| `admin.js` | `/api/orders/:id/status` | `PATCH` | Cập nhật trạng thái đơn hàng | Route/Controller tồn tại nhưng chưa mount |
| `admin.js` | `/api/products` | `GET` | Xem danh sách sản phẩm | Đã hoạt động |
| `admin.js` | `/api/admin/reports/revenue` | `GET` | Thống kê doanh thu | Route/Controller tồn tại nhưng chưa mount |

---

## 3. Các Route tồn tại nhưng chưa mount trong `server.js`

Trong [server.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/backend/src/server.js) hiện tại, chỉ mount 2 bộ route:
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
```

Các route sau đã được định nghĩa trong mã nguồn nhưng **chưa được mount**:
- **Cart routes:** [cart.routes.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/backend/src/modules/cart/cart.routes.js) (Chưa mount vào `/api/cart`).
- **Order routes:** [order.routes.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/backend/src/modules/order/order.routes.js) (Chưa mount vào `/api/orders`).
- **Admin routes:** [admin.routes.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/backend/src/modules/admin/admin.routes.js) (Chưa mount vào `/api/admin`).

---

## 4. Các điểm không đồng nhất giữa Backend và Frontend

Qua rà soát chi tiết, phát hiện các điểm không đồng nhất quan trọng sau:

1. **Khóa lưu trữ LocalStorage:**
   - [api.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/frontend/assets/js/api.js) dùng `token` và `user`.
   - [auth.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/frontend/assets/js/auth.js) dùng `accessToken` và `userInfo`.
   - **Khắc phục (Đã làm rõ):** Sẽ sửa [auth.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/frontend/assets/js/auth.js) để thống nhất dùng `token` và `user` như [api.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/frontend/assets/js/api.js).

2. **Cách viết trường Tên Người Dùng (Fullname):**
   - Database và backend sử dụng thuộc tính `fullname` (viết thường toàn bộ chữ n).
   - [api.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/frontend/assets/js/api.js) dùng `user.fullName` (chữ N hoa).
   - **Khắc phục (Đã làm rõ):** Thống nhất dùng thuộc tính `fullname` ở cả frontend và backend. Sẽ sửa file frontend [api.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/frontend/assets/js/api.js) và các file liên quan để dùng `user.fullname`.

3. **Cấu hình API_BASE cho Dev Local:**
   - Trong [api.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/frontend/assets/js/api.js), `API_BASE` đang để rỗng `""`. Điều này làm lỗi fetch khi chạy local frontend khác cổng backend.
   - **Khắc phục (Đã làm rõ):** Chuyển thành tự động nhận diện: `API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') ? 'http://localhost:3000' : '';`.

4. **Trường categoryName khi hiển thị danh sách sản phẩm quản trị:**
   - Trong [admin.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/frontend/assets/js/admin.js) line 16, frontend mong đợi sản phẩm trả về thuộc tính `categoryName` (`p.categoryName`). Nhưng database `Product` chỉ có `categoryId`.
   - **Khắc phục:** Cần bổ sung logic liên kết (association) hoặc lấy tên danh mục trong backend trả về cho API để frontend có thể hiển thị chính xác tên danh mục thay vì trống.

5. **Trường customer.fullName trong hiển thị quản lý đơn hàng:**
   - Trong [admin.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/frontend/assets/js/admin.js) line 7, frontend dùng `o.customer?.fullName` để hiển thị tên khách hàng. Nhưng trong CSDL và backend seeding, user chỉ có `fullname`.
   - **Khắc phục:** Thay đổi frontend [admin.js](file:///d:/He-thong-web-ban-lien-kien-dien-tu/frontend/assets/js/admin.js) thành `o.customer?.fullname` để hiển thị đúng.

---

## 5. Kế hoạch loại bỏ `db.json` theo từng đợt

Để không phá vỡ hoạt động hiện tại, `db.json` sẽ được loại bỏ dần theo lộ trình sau:
- **Đợt 1:** Giữ nguyên `db.json` cho Cart và Order. Chỉ cấu hình Sequelize CLI và di chuyển cấu trúc PostgreSQL cho các bảng tĩnh như `users`, `products` và `categories`.
- **Đợt 2:** Module `auth` chuyển đổi hoàn toàn sang DB PostgreSQL (đã có model User sẵn, chỉ cần cấu hình migration/seeders chuẩn).
- **Đợt 5:** Chuyển đổi module `cart` sang PostgreSQL, loại bỏ tham chiếu `db.json` trong Cart module.
- **Đợt 6:** Chuyển đổi module `order` sang PostgreSQL, chính thức xóa bỏ hoàn toàn `db.json` ra khỏi hệ thống.
