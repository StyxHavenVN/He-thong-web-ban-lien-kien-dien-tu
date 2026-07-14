const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const sequelize = require('./data/config/database');
const User = require('./modules/auth/user.model');
const Product = require('./modules/product/product.model');
const bcrypt = require('bcryptjs');

// Đồng bộ CSDL
sequelize.sync({ alter: true })
    .then(async () => {
        console.log('✅ PostgreSQL Database connected and synchronized.');

        // 1. TẠO TÀI KHOẢN MẪU
        const adminExists = await User.findOne({ where: { email: 'admin@shop.local' } });
        if (!adminExists) {
            const defaultPassword = await bcrypt.hash('123456', 10);
            await User.bulkCreate([
                { fullname: "Quản trị viên", email: "admin@shop.local", phone: "0900000001", password: defaultPassword, role: "ADMIN" },
                { fullname: "Nhân viên kho", email: "staff@shop.local", phone: "0900000002", password: defaultPassword, role: "STAFF" },
                { fullname: "Khách hàng mẫu", email: "customer@shop.local", phone: "0900000003", password: defaultPassword, role: "CUSTOMER" }
            ]);
            console.log('✅ Đã tạo tài khoản mẫu!');
        }

        // 2. TẠO SẢN PHẨM MẪU (FR03)
        const productCount = await Product.count();
        if (productCount === 0) {
            await Product.bulkCreate([
                { name: "Intel Core i5-12400F", categoryId: "cat-cpu", brand: "Intel", price: 3390000, stock: 12, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Intel+i5", description: "CPU 6 nhân 12 luồng.", specs: { "socket": "LGA1700", "ramType": "DDR4" }, badge: "MỚI", rating: 4.8, reviews: 32 },
                { name: "NVIDIA RTX 3060 12GB", categoryId: "cat-vga", brand: "NVIDIA", price: 6990000, oldPrice: 7500000, stock: 4, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=RTX+3060", specs: { "vram": "12GB", "power": 550 }, badge: "-7%", rating: 4.9, reviews: 15 },
                { name: "ASUS PRIME B660M-K", categoryId: "cat-mainboard", brand: "ASUS", price: 2490000, stock: 6, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=ASUS+B660M", specs: { "socket": "LGA1700", "ramType": "DDR4" }, rating: 4.5, reviews: 22 },
                { name: "Corsair Vengeance 16GB", categoryId: "cat-ram", brand: "Corsair", price: 990000, stock: 20, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=RAM+16GB", specs: { "type": "DDR4", "bus": 3200 }, badge: "MỚI", rating: 4.7, reviews: 88 },
                { name: "Samsung 980 1TB NVMe", categoryId: "cat-ssd", brand: "Samsung", price: 1690000, stock: 15, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=SSD+1TB", specs: { "capacity": "1TB", "type": "NVMe" }, rating: 5.0, reviews: 45 }
            ]);
            console.log('✅ Đã tạo dữ liệu linh kiện mẫu!');
        }
    })
    .catch(err => console.error('❌ DB connection error:', err));

// ================= API ROUTES =================
const authRoutes = require('./modules/auth/auth.routes');
const productRoutes = require('./modules/product/product.routes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Backend server is running on port ${PORT}`);
});