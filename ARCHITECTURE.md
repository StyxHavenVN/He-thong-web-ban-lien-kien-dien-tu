# Architecture Decision Record

## 1. Client–Server

`frontend/` là client HTML/CSS/JavaScript thuần. `backend/` là Express REST API. Nginx phục vụ client và reverse proxy `/api` sang backend.

## 2. Layered Architecture

| Tầng | Trách nhiệm | Không được làm |
|---|---|---|
| Route | Khai báo endpoint và middleware | Không xử lý nghiệp vụ |
| Controller | Đọc request, gọi service, tạo response | Không gọi model/repository |
| Service | Validation và quy tắc nghiệp vụ | Không phụ thuộc `req`/`res` |
| Repository | Truy vấn Sequelize/PostgreSQL | Không xử lý HTTP |
| Model | Định nghĩa bảng và quan hệ | Không điều phối use case |

## 3. Modular Monolith

Mỗi use case nằm trong một module nghiệp vụ. Các module dùng chung repository và cùng được khởi chạy bởi `backend/src/server.js`, do đó vẫn là một monolith để triển khai và vận hành.

## 4. Luồng đặt hàng

1. `order.routes` xác thực khách hàng.
2. `order.controller` chuyển request vào `order.service`.
3. Service mở transaction PostgreSQL.
4. Repository đọc giỏ hàng và khóa bản ghi sản phẩm.
5. Service kiểm tra tồn kho, tính phí và tạo đơn.
6. Các adapter mô phỏng tạo payment, shipment và notification.
7. Repository trừ tồn kho, xóa giỏ hàng và commit cùng transaction.

## 5. Phân quyền

- `CUSTOMER`: giỏ hàng, checkout, lịch sử đơn của chính mình.
- `STAFF`: xem và cập nhật trạng thái đơn hàng.
- `ADMIN`: toàn quyền staff, sản phẩm, danh mục, khách hàng và báo cáo.

## 6. Dữ liệu

PostgreSQL là nguồn dữ liệu duy nhất. Không dùng JSON file repository. Sequelize model và association được tập trung tại `backend/src/data/models/index.js`.
