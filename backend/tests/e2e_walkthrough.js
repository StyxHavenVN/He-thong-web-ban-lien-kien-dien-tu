const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Thư mục lưu ảnh chụp màn hình trong thư mục báo cáo (Artifacts)
const screenshotDir = 'C:/Users/ACER/.gemini/antigravity/brain/3ab8f45c-504e-4d11-8ee7-beb9d51d1c18/screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log("=== BẮT ĐẦU CHẠY THỬ NGHIỆM GIAO DIỆN (E2E WALKTHROUGH) ===");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Thiết lập kích thước màn hình chuẩn desktop
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. Vào trang danh sách sản phẩm
  console.log("1. Điều hướng tới trang sản phẩm...");
  const response = await page.goto('http://localhost:3000/products.html');
  console.log("HTTP Status:", response ? response.status() : 'No response');
  console.log("Tiêu đề trang:", await page.title());
  await page.waitForTimeout(2500); // Đợi tải API và render
  await page.screenshot({ path: path.join(screenshotDir, '01_danh_sach_ban_dau.png') });

  // 2. Thử tìm kiếm từ khóa "RTX"
  console.log("2. Tìm kiếm từ khóa 'RTX'...");
  await page.fill('#search-input', 'RTX');
  await page.click('#search-btn');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, '02_tim_kiem_rtx.png') });

  // 3. Click chọn danh mục CPU
  console.log("3. Click danh mục CPU ở sidebar...");
  await page.click('a[data-category="cat-cpu"]');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, '03_danh_muc_cpu.png') });

  // 4. Lọc hãng "AMD"
  console.log("4. Lọc theo hãng AMD...");
  await page.evaluate(() => {
    const cb = document.querySelector('input[value="AMD"]');
    if (cb) {
      cb.checked = true;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, '04_loc_hang_amd.png') });

  // 5. Quay lại tất cả sản phẩm để click vào sản phẩm đầu tiên
  console.log("5. Quay lại tất cả sản phẩm bằng cách tải lại trang...");
  await page.goto('http://localhost:3000/products.html');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotDir, '05_tat_ca_san_pham_reset.png') });
  
  // Click vào card sản phẩm đầu tiên
  console.log("6. Click vào card sản phẩm đầu tiên để xem chi tiết...");
  const firstCard = await page.locator('.catalog-card').first();
  await firstCard.click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(screenshotDir, '06_chi_tiet_san_pham.png') });

  console.log("=== CHẠY THỬ NGHIỆM GIAO DIỆN HOÀN TẤT! ===");
  await browser.close();
}

run().catch(err => {
  console.error("LỖI KHI CHẠY E2E:", err);
  process.exit(1);
});
