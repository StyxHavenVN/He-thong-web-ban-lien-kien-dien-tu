# Sử dụng image Node.js gọn nhẹ
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn backend vào container
COPY backend/ ./

# Mở cổng 3000 cho Node.js
EXPOSE 3000

# Lệnh khởi chạy server
CMD ["npm", "start"]
