const bcrypt = require('bcryptjs');
const { User, Category, Product } = require('./models');

const categories = [
  ['cat-cpu', 'CPU - Bộ xử lý', 'cpu', 'assets/categories/cpu_ver2.png'],
  ['cat-mainboard', 'Mainboard', 'mainboard', 'assets/categories/mainboard.png'],
  ['cat-ram', 'RAM', 'ram', 'assets/categories/ram.png'],
  ['cat-vga', 'Card màn hình', 'vga', 'assets/categories/vga.png'],
  ['cat-ssd', 'Ổ cứng SSD', 'ssd', 'assets/categories/ssd.png'],
  ['cat-psu', 'Nguồn máy tính', 'psu', 'assets/categories/psu.png'],
  ['cat-case', 'Vỏ máy tính', 'case', 'assets/categories/case.png'],
  ['cat-cooler', 'Tản nhiệt', 'cooler', 'assets/categories/cooler.png'],
  ['cat-monitor', 'Màn hình', 'monitor', 'assets/categories/screen.png'],
  ['cat-keyboard', 'Bàn phím', 'keyboard', 'assets/categories/keyboard.jpg']
].map(([id, name, slug, image]) => ({ id, name, slug, image }));

const products = [
  ['Intel Core i5-12400F', 'cat-cpu', 'Intel', 3390000, 12, 'assets/categories/cpu.png', { socket: 'LGA1700', ram: 'DDR4' }, 'HOT'],
  ['Intel Core i7-14700K', 'cat-cpu', 'Intel', 10990000, 5, 'assets/categories/cpu_ver2.png', { socket: 'LGA1700', ram: 'DDR5' }, 'MỚI'],
  ['AMD Ryzen 5 5600X', 'cat-cpu', 'AMD', 3590000, 15, 'assets/categories/cpu.png', { socket: 'AM4', ram: 'DDR4' }, null],
  ['AMD Ryzen 7 7800X3D', 'cat-cpu', 'AMD', 10490000, 8, 'assets/categories/cpu_ver2.png', { socket: 'AM5', ram: 'DDR5' }, 'MỚI'],
  ['ASUS PRIME B660M-K D4', 'cat-mainboard', 'ASUS', 2490000, 20, 'assets/categories/mainboard.png', { socket: 'LGA1700', ram: 'DDR4' }, null],
  ['MSI B550M PRO-VDH WIFI', 'cat-mainboard', 'MSI', 2590000, 7, 'assets/categories/mainboard.png', { socket: 'AM4', ram: 'DDR4' }, '-7%'],
  ['Gigabyte B650M AORUS ELITE AX', 'cat-mainboard', 'Gigabyte', 4890000, 7, 'assets/categories/mainboard.png', { socket: 'AM5', ram: 'DDR5' }, 'MỚI'],
  ['Corsair Vengeance LPX 16GB DDR4', 'cat-ram', 'Corsair', 990000, 35, 'assets/categories/ram.png', { type: 'DDR4', bus: 3200 }, 'BÁN CHẠY'],
  ['G.Skill Trident Z5 RGB 32GB DDR5', 'cat-ram', 'G.Skill', 3290000, 15, 'assets/categories/ram.png', { type: 'DDR5', bus: 6000 }, 'HOT'],
  ['ASUS Dual GeForce RTX 3060 12GB', 'cat-vga', 'ASUS', 6990000, 14, 'assets/categories/vga.png', { vram: '12GB', requiredPower: 550 }, '-7%'],
  ['Gigabyte RTX 4070 SUPER 12GB', 'cat-vga', 'Gigabyte', 16990000, 6, 'assets/categories/vga.png', { vram: '12GB', requiredPower: 650 }, 'MỚI'],
  ['MSI Radeon RX 7800 XT 16GB', 'cat-vga', 'MSI', 14590000, 4, 'assets/categories/vga.png', { vram: '16GB', requiredPower: 700 }, '-4%'],
  ['Samsung 980 1TB NVMe', 'cat-ssd', 'Samsung', 1690000, 25, 'assets/categories/ssd.png', { capacity: '1TB', type: 'NVMe Gen 3' }, 'BÁN CHẠY'],
  ['WD Black SN850X 2TB NVMe', 'cat-ssd', 'Western Digital', 4290000, 10, 'assets/categories/ssd.png', { capacity: '2TB', type: 'NVMe Gen 4' }, '-10%'],
  ['Cooler Master MWE 650W Bronze', 'cat-psu', 'Cooler Master', 1250000, 18, 'assets/categories/psu.png', { power: 650, certificate: '80 Plus Bronze' }, null],
  ['Corsair RM850e 850W Gold', 'cat-psu', 'Corsair', 2890000, 12, 'assets/categories/psu.png', { power: 850, certificate: '80 Plus Gold' }, 'HOT'],
  ['NZXT H5 Flow Matte Black', 'cat-case', 'NZXT', 2190000, 8, 'assets/categories/case.png', { form: 'Mid Tower' }, null],
  ['DeepCool AK400 Digital', 'cat-cooler', 'DeepCool', 950000, 22, 'assets/categories/cooler.png', { type: 'Air Cooler' }, 'MỚI'],
  ['Màn hình LG 24MR400 24 inch 100Hz', 'cat-monitor', 'LG', 2590000, 16, 'assets/categories/screen.png', { size: '24 inch', refreshRate: '100Hz' }, '-10%'],
  ['Bàn phím cơ Keychron K8 Pro', 'cat-keyboard', 'Keychron', 2490000, 11, 'assets/categories/keyboard.jpg', { layout: 'TKL' }, null]
].map(([name, categoryId, brand, price, stock, image, specs, badge]) => ({
  name, categoryId, brand, price, stock, image, specs, badge,
  description: `${name} chính hãng, bảo hành đầy đủ tại BlueTech.`,
  rating: 4.8,
  reviews: 42
}));

async function seedDatabase() {
  const password = await bcrypt.hash('123456', 10);
  const users = [
    { fullname: 'Quản trị viên', email: 'admin@shop.local', phone: '0900000001', role: 'ADMIN' },
    { fullname: 'Nhân viên kho', email: 'staff@shop.local', phone: '0900000002', role: 'STAFF' },
    { fullname: 'Khách hàng mẫu', email: 'customer@shop.local', phone: '0900000003', role: 'CUSTOMER', address: 'Đà Nẵng' }
  ];
  for (const user of users) await User.findOrCreate({ where: { email: user.email }, defaults: { ...user, password, status: 'ACTIVE' } });
  for (const category of categories) await Category.findOrCreate({ where: { id: category.id }, defaults: category });
  for (const product of products) await Product.findOrCreate({ where: { name: product.name }, defaults: product });
}

module.exports = { seedDatabase };
