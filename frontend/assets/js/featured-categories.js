document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('featured-category-grid');
  if (!grid) return;

  const categories = {
    components: [
      ['cat-cpu', 'CPU', 'Bộ vi xử lý', 'assets/categories/cpu.png'],
      ['cat-vga', 'VGA', 'Card màn hình', 'assets/categories/vga.png'],
      ['cat-mainboard', 'Mainboard', 'Bo mạch chủ', 'assets/categories/mainboard.png'],
      ['cat-ram', 'RAM', 'Bộ nhớ trong', 'assets/categories/ram.png'],
      ['cat-ssd', 'SSD', 'Ổ cứng SSD', 'assets/categories/ssd.png'],
      ['cat-psu', 'Nguồn - PSU', 'Nguồn máy tính', 'assets/categories/psu.png'],
      ['cat-case', 'Vỏ Case', 'Vỏ máy tính', 'assets/categories/case.png'],
      ['cat-cooler', 'Tản nhiệt', 'Tản nhiệt CPU', 'assets/categories/cooler.png']
    ],
    laptop: [
      ['cat-laptop', 'Laptop', 'Laptop học tập và gaming', 'assets/images/product-placeholder.svg']
    ],
    accessories: [
      ['cat-keyboard', 'Bàn phím', 'Bàn phím cơ và văn phòng', 'assets/categories/keyboard.jpg'],
      ['cat-mouse', 'Chuột', 'Chuột có dây và không dây', 'assets/images/product-placeholder.svg'],
      ['cat-headset', 'Tai nghe', 'Tai nghe gaming', 'assets/images/product-placeholder.svg']
    ],
    monitor: [
      ['cat-monitor', 'Màn hình', 'Màn hình học tập và gaming', 'assets/categories/screen.png']
    ],
    peripherals: [
      ['cat-keyboard', 'Bàn phím', 'Bàn phím cơ và văn phòng', 'assets/categories/keyboard.jpg'],
      ['cat-mouse', 'Chuột', 'Chuột có dây và không dây', 'assets/images/product-placeholder.svg'],
      ['cat-headset', 'Tai nghe', 'Tai nghe gaming', 'assets/images/product-placeholder.svg'],
      ['cat-monitor', 'Màn hình', 'Thiết bị hiển thị', 'assets/categories/screen.png']
    ]
  };

  let activeGroup = 'components';

  function render() {
    const items = categories[activeGroup] || [];
    grid.innerHTML = items.map(([id, name, description, image]) => `
      <a class="cat-card" href="products.html?category=${encodeURIComponent(id)}">
        <img src="${image}" alt="${name}">
        <h4>${name}</h4>
        <p>${description}</p>
      </a>`).join('');
  }

  document.querySelectorAll('[data-category-group]').forEach((button) => {
    button.addEventListener('click', () => {
      activeGroup = button.dataset.categoryGroup;
      document.querySelectorAll('[data-category-group]').forEach((item) => item.classList.toggle('active', item === button));
      render();
    });
  });

  render();
});
