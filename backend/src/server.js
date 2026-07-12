const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // Tự động in log ra terminal

// ================= KẾT NỐI DATABASE POSTGRESQL =================
const sequelize = require("./data/config/database");
// Import tất cả model trước khi sync
require("./modules/auth/user.model");

// Đồng bộ các Model (Bảng) vào Database
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ PostgreSQL Database connected and synchronized."))
  .catch((err) => console.error("❌ Database connection error:", err));

// ================= API ROUTES (MODULAR) =================
// Import các route từ các module
const authRoutes = require("./modules/auth/auth.routes");

// Gắn route vào app
app.use("/api/auth", authRoutes);

// Dữ liệu sản phẩm giả lập tạm thời (Chờ bạn làm FR03 - Module Product)
const tempProducts = [
  {
    id: 1,
    name: "ASUS TUF Gaming GeForce RTX 4060 Ti",
    price: 11990000,
    oldPrice: null,
    rating: 4.5,
    reviews: 32,
    badge: "MỚI",
  },
  {
    id: 2,
    name: "MSI GeForce RTX 4070 Ventus 3X",
    price: 17990000,
    oldPrice: 19490000,
    rating: 4.0,
    reviews: 28,
    badge: "-8%",
  },
  {
    id: 3,
    name: "Gigabyte GeForce RTX 4060 EAGLE OC",
    price: 9490000,
    oldPrice: null,
    rating: 4.0,
    reviews: 15,
    badge: "MỚI",
  },
  {
    id: 4,
    name: "ASUS ROG Strix GeForce RTX 4080",
    price: 32990000,
    oldPrice: 34990000,
    rating: 5.0,
    reviews: 18,
    badge: "-5%",
  },
];

app.get("/api/products", (req, res) => {
  res.json({ success: true, data: tempProducts });
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});
