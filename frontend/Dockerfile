# Sử dụng Nginx siêu nhẹ
FROM nginx:alpine

# Xóa trang web mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy toàn bộ code frontend (html, css, js) vào Nginx
COPY ./ /usr/share/nginx/html/

# Copy file cấu hình nginx (ghi đè file mặc định)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80 trong container
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]