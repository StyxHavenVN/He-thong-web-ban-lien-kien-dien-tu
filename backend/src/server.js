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

// 2. TẠO SẢN PHẨM MẪU (FR03) - BỘ DỮ LIỆU ĐẦY ĐỦ
        const productCount = await Product.count();
        if (productCount < 20) { // Đổi điều kiện để nó tự chèn thêm nếu thiếu
            // Xóa dữ liệu cũ để nạp bộ mới cho đồng bộ (Tùy chọn)
            await Product.destroy({ where: {} });

            await Product.bulkCreate([
                // --- 1. CPU (cat-cpu) ---
                { name: "Intel Core i5-12400F", categoryId: "cat-cpu", brand: "Intel", price: 3390000, stock: 12, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Intel+Core+i5", description: "CPU quốc dân 6 nhân 12 luồng.", specs: { "socket": "LGA1700" }, badge: "HOT", rating: 4.8, reviews: 124 },
                { name: "Intel Core i7-14700K", categoryId: "cat-cpu", brand: "Intel", price: 10990000, oldPrice: 11500000, stock: 5, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Intel+Core+i7", description: "Siêu phẩm 20 nhân 28 luồng thế hệ 14.", specs: { "socket": "LGA1700" }, badge: "MỚI", rating: 5.0, reviews: 42 },
                { name: "AMD Ryzen 5 5600X", categoryId: "cat-cpu", brand: "AMD", price: 3590000, stock: 15, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Ryzen+5+5600X", description: "Vua hiệu năng tầm trung từ AMD.", specs: { "socket": "AM4" }, rating: 4.9, reviews: 88 },
                { name: "AMD Ryzen 7 7800X3D", categoryId: "cat-cpu", brand: "AMD", price: 10490000, stock: 8, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Ryzen+7+7800X3D", description: "CPU Gaming mạnh nhất thế giới hiện tại.", specs: { "socket": "AM5" }, badge: "MỚI", rating: 4.9, reviews: 56 },

                // --- 2. VGA - Card Màn Hình (cat-vga) ---
                { name: "NVIDIA RTX 3060 12GB ASUS DUAL", categoryId: "cat-vga", brand: "NVIDIA", price: 6990000, oldPrice: 7500000, stock: 14, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=RTX+3060", specs: { "vram": "12GB", "power": "550W" }, badge: "-7%", rating: 4.9, reviews: 215 },
                { name: "NVIDIA RTX 4070 SUPER 12GB Gigabyte", categoryId: "cat-vga", brand: "NVIDIA", price: 16990000, stock: 6, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=RTX+4070+SUPER", specs: { "vram": "12GB", "power": "650W" }, badge: "MỚI", rating: 5.0, reviews: 12 },
                { name: "AMD Radeon RX 7800 XT 16GB MSI", categoryId: "cat-vga", brand: "AMD", price: 14590000, oldPrice: 15200000, stock: 4, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=RX+7800+XT", specs: { "vram": "16GB", "power": "700W" }, badge: "-4%", rating: 4.8, reviews: 34 },
                { name: "NVIDIA RTX 4090 24GB ROG Strix", categoryId: "cat-vga", brand: "NVIDIA", price: 59990000, stock: 2, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=RTX+4090", specs: { "vram": "24GB", "power": "1000W" }, badge: "VIP", rating: 5.0, reviews: 8 },

                // --- 3. Mainboard (cat-mainboard) ---
                { name: "ASUS PRIME B660M-K D4", categoryId: "cat-mainboard", brand: "ASUS", price: 2490000, stock: 20, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=ASUS+B660M", specs: { "socket": "LGA1700", "ram": "DDR4" }, rating: 4.5, reviews: 67 },
                { name: "MSI MAG B760M MORTAR WIFI", categoryId: "cat-mainboard", brand: "MSI", price: 4290000, oldPrice: 4500000, stock: 10, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=MSI+B760M", specs: { "socket": "LGA1700", "ram": "DDR5" }, badge: "HOT", rating: 4.8, reviews: 43 },
                { name: "Gigabyte B650M AORUS ELITE AX", categoryId: "cat-mainboard", brand: "Gigabyte", price: 4890000, stock: 7, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=AORUS+B650M", specs: { "socket": "AM5", "ram": "DDR5" }, rating: 4.7, reviews: 29 },

                // --- 4. RAM (cat-ram) ---
                { name: "Corsair Vengeance LPX 16GB (2x8GB)", categoryId: "cat-ram", brand: "Corsair", price: 990000, stock: 35, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=RAM+Corsair+16GB", specs: { "type": "DDR4", "bus": 3200 }, badge: "SALE", rating: 4.9, reviews: 312 },
                { name: "G.Skill Trident Z5 RGB 32GB (2x16GB)", categoryId: "cat-ram", brand: "G.Skill", price: 3290000, stock: 15, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Trident+Z5+32GB", specs: { "type": "DDR5", "bus": 6000 }, badge: "HOT", rating: 5.0, reviews: 85 },
                { name: "Kingston FURY Beast 8GB", categoryId: "cat-ram", brand: "Kingston", price: 550000, stock: 50, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Kingston+8GB", specs: { "type": "DDR4", "bus": 3200 }, rating: 4.7, reviews: 142 },

                // --- 5. Ổ cứng SSD (cat-ssd) ---
                { name: "Samsung 980 1TB PCIe NVMe", categoryId: "cat-ssd", brand: "Samsung", price: 1690000, stock: 25, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Samsung+980+1TB", specs: { "capacity": "1TB", "type": "Gen 3" }, rating: 5.0, reviews: 405 },
                { name: "WD Black SN850X 2TB NVMe", categoryId: "cat-ssd", brand: "Western Digital", price: 4290000, oldPrice: 4800000, stock: 10, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=WD+SN850X+2TB", specs: { "capacity": "2TB", "type": "Gen 4" }, badge: "-10%", rating: 4.9, reviews: 67 },
                { name: "Kingston NV2 500GB PCIe 4.0", categoryId: "cat-ssd", brand: "Kingston", price: 890000, stock: 40, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Kingston+NV2+500GB", specs: { "capacity": "500GB", "type": "Gen 4" }, rating: 4.6, reviews: 210 },

                // --- 6. Nguồn - PSU (cat-psu) ---
                { name: "Cooler Master MWE 650 V2 80+ Bronze", categoryId: "cat-psu", brand: "Cooler Master", price: 1250000, stock: 18, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=PSU+650W", specs: { "power": "650W", "cert": "Bronze" }, rating: 4.7, reviews: 93 },
                { name: "Corsair RM850e 80 Plus Gold - Fully Modular", categoryId: "cat-psu", brand: "Corsair", price: 2890000, stock: 12, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Corsair+RM850e", specs: { "power": "850W", "cert": "Gold" }, badge: "HOT", rating: 4.9, reviews: 54 },

                // --- 7. Vỏ Case (cat-case) ---
                { name: "NZXT H5 Flow Matte Black", categoryId: "cat-case", brand: "NZXT", price: 2190000, stock: 8, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=NZXT+H5+Flow", specs: { "form": "Mid Tower", "color": "Black" }, rating: 4.8, reviews: 76 },
                { name: "Corsair 4000D Airflow Tempered Glass", categoryId: "cat-case", brand: "Corsair", price: 2290000, oldPrice: 2490000, stock: 6, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Corsair+4000D", specs: { "form": "Mid Tower", "color": "White" }, badge: "-8%", rating: 4.9, reviews: 122 },

                // --- 8. Tản nhiệt (cat-cooler) ---
                { name: "Tản nhiệt khí Deepcool AK400 Digital", categoryId: "cat-cooler", brand: "Deepcool", price: 950000, stock: 22, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=AK400+Digital", specs: { "type": "Air Cooler" }, badge: "MỚI", rating: 4.8, reviews: 34 },
                { name: "Tản nhiệt nước NZXT Kraken 240 RGB", categoryId: "cat-cooler", brand: "NZXT", price: 3890000, stock: 5, image: "https://placehold.co/400x250/f0f1f3/555f6e?text=Kraken+240+RGB", specs: { "type": "AIO 240mm" }, rating: 5.0, reviews: 19 },

                // Thêm vào danh sách sản phẩm mẫu
                { name: "Laptop ASUS Gaming TUF", categoryId: "cat-laptop-gaming", brand: "ASUS", price: 21900000, image: "https://placehold.co/400x250?text=ASUS+TUF", description: "Laptop gaming mạnh mẽ" },
                { name: "PC Văn phòng BlueTech Office", categoryId: "cat-pc-full", brand: "BlueTech", price: 8900000, image: "https://placehold.co/400x250?text=PC+Office", description: "PC làm việc văn phòng" },
                { name: "Màn hình LG 24 inch 75Hz", categoryId: "cat-monitor", brand: "LG", price: 2900000, image: "https://placehold.co/400x250?text=LG+Monitor", description: "Màn hình sắc nét" },
                { name: "Tai nghe Gaming HyperX Cloud II", categoryId: "cat-audio", brand: "HyperX", price: 1990000, image: "https://placehold.co/400x250?text=HyperX+Audio", description: "Âm thanh vòm chất lượng" }
            ]);
            console.log('✅ Đã tạo một bộ 22 Dữ liệu Linh kiện Đa dạng!');
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