const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/data/config/database');
const Product = require('../src/modules/product/product.model');
const Category = require('../src/modules/product/category.model');

describe('Product API Integration Tests', () => {
  let createdVgaCategory;
  let createdCpuCategory;

  beforeAll(async () => {
    // Làm sạch bảng liên quan trước khi chạy test
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });

    // Tạo danh mục mẫu
    createdVgaCategory = await Category.create({
      id: 'cat-vga-test',
      name: 'Card màn hình'
    });
    createdCpuCategory = await Category.create({
      id: 'cat-cpu-test',
      name: 'CPU'
    });
  });

  beforeEach(async () => {
    try {
      // Làm sạch bảng sản phẩm
      await Product.destroy({ where: {} });

      // Nạp dữ liệu sản phẩm mẫu chuẩn cho các test case
      await Product.bulkCreate([
        {
          id: 'f1000000-0000-0000-0000-000000000001',
          name: 'Asus RTX 4060 Dual',
          categoryId: 'cat-vga-test',
          brand: 'Asus',
          price: 9000000,
          stock: 15,
          active: true
        },
        {
          id: 'f1000000-0000-0000-0000-000000000002',
          name: 'Gigabyte RTX 4070 Gaming',
          categoryId: 'cat-vga-test',
          brand: 'Gigabyte',
          price: 15000000,
          stock: 5,
          active: true
        },
        {
          id: 'f1000000-0000-0000-0000-000000000003',
          name: 'Intel Core i5-13400F',
          categoryId: 'cat-cpu-test',
          brand: 'Intel',
          price: 5000000,
          stock: 20,
          active: true
        },
        {
          id: 'f1000000-0000-0000-0000-000000000004',
          name: 'AMD Ryzen 5 7600',
          categoryId: 'cat-cpu-test',
          brand: 'AMD',
          price: 6000000,
          stock: 10,
          active: true
        },
        {
          id: 'f1000000-0000-0000-0000-000000000005',
          name: 'MSI RTX 4060 Ti Ventus',
          categoryId: 'cat-vga-test',
          brand: 'MSI',
          price: 11000000,
          stock: 0,
          active: false // Sản phẩm đã ngừng kinh doanh
        }
      ]);
    } catch (error) {
      console.error("LỖI BULK CREATE CHI TIẾT:", error.message, error.original ? error.original.message : '');
      throw error;
    }
  });

  afterAll(async () => {
    // Xóa dữ liệu rác sau khi kiểm thử và đóng kết nối DB
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await sequelize.close();
  });

  describe('GET /api/products', () => {
    // 1. Kiểm tra Phân trang (Pagination)
    it('should paginate products correctly', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=2')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveLength(2); // Giới hạn 2 sản phẩm
      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 2,
        totalItems: 4, // Tổng cộng 4 sản phẩm đang active (không tính MSI)
        totalPages: 2
      });
    });

    // 2. Kiểm tra Tìm kiếm (Keyword Search)
    it('should search products by keyword in name', async () => {
      const res = await request(app)
        .get('/api/products?keyword=RTX')
        .expect(200);

      expect(res.body.data).toHaveLength(2); // Asus RTX và Gigabyte RTX (MSI không trả về vì active = false)
      expect(res.body.data[0].name).toContain('RTX');
    });

    // 3. Kiểm tra Lọc danh mục (Category Filtering)
    it('should filter products by categoryId', async () => {
      const res = await request(app)
        .get('/api/products?categoryId=cat-cpu-test')
        .expect(200);

      expect(res.body.data).toHaveLength(2); // Intel Core i5 và AMD Ryzen 5
      expect(res.body.data.every(p => p.categoryId === 'cat-cpu-test')).toBe(true);
    });

    // 4. Kiểm tra Lọc hãng (Brand Filtering - nhiều hãng)
    it('should filter products by multiple brands', async () => {
      const res = await request(app)
        .get('/api/products?brand=Intel,AMD')
        .expect(200);

      expect(res.body.data).toHaveLength(2); // Hãng Intel và AMD
      expect(res.body.data.every(p => p.brand === 'Intel' || p.brand === 'AMD')).toBe(true);
    });

    // 5. Kiểm tra Lọc khoảng giá (Price Range Filtering)
    it('should filter products within a price range', async () => {
      const res = await request(app)
        .get('/api/products?minPrice=5500000&maxPrice=10000000')
        .expect(200);

      expect(res.body.data).toHaveLength(2); // Asus RTX 4060 (9tr) và AMD Ryzen 5 7600 (6tr)
      expect(res.body.data.every(p => p.price >= 5500000 && p.price <= 10000000)).toBe(true);
    });

    // 6. Kiểm tra Tham số truy vấn không hợp lệ (Invalid Query validation)
    it('should return 400 when minPrice > maxPrice', async () => {
      const res = await request(app)
        .get('/api/products?minPrice=10000000&maxPrice=5000000')
        .expect(400);

      expect(res.body.message).toContain('minPrice không được lớn hơn maxPrice');
    });

    it('should return 400 when page or limit is negative', async () => {
      await request(app)
        .get('/api/products?page=-1')
        .expect(400);

      await request(app)
        .get('/api/products?limit=-5')
        .expect(400);
    });

    // 7. Kiểm tra Danh sách rỗng (Empty result handling)
    it('should handle empty result when no product matches filters', async () => {
      const res = await request(app)
        .get('/api/products?keyword=KeyboardNonExistent')
        .expect(200);

      expect(res.body.data).toHaveLength(0);
      expect(res.body.pagination.totalItems).toBe(0);
    });

    // 8. Ẩn sản phẩm ngừng kinh doanh khỏi danh sách
    it('should not return inactive products in the product catalog', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);

      // Đảm bảo không có sản phẩm nào có active = false được trả về
      expect(res.body.data.every(p => p.active === true)).toBe(true);
      expect(res.body.data.find(p => p.name.includes('MSI'))).toBeUndefined();
    });
  });

  describe('GET /api/products/:id', () => {
    // 9. Kiểm tra ID không tồn tại
    it('should return 404 when product ID does not exist', async () => {
      const res = await request(app)
        .get('/api/products/c0a1a1a2-9999-9999-9999-999999999999')
        .expect(404);

      expect(res.body.message).toContain('Sản phẩm không tồn tại hoặc đã ngừng kinh doanh');
    });

    // 10. Kiểm tra Sản phẩm ngừng kinh doanh
    it('should return 404 for inactive products', async () => {
      const res = await request(app)
        .get('/api/products/f1000000-0000-0000-0000-000000000005') // MSI có active = false
        .expect(404);

      expect(res.body.message).toContain('ngừng kinh doanh');
    });

    // 11. Thành công: Lấy chi tiết sản phẩm và Category
    it('should return product detail including category details', async () => {
      const res = await request(app)
        .get('/api/products/f1000000-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Asus RTX 4060 Dual');
      expect(res.body.data).toHaveProperty('category');
      expect(res.body.data.category.name).toBe('Card màn hình');
    });
  });
});
