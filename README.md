# 🛒 E-Commerce Website - Hướng dẫn cài đặt & chạy dự án

## 📦 Yêu cầu phần mềm

| Phần mềm | Phiên bản | Ghi chú |
|----------|-----------|---------|
| [Node.js](https://nodejs.org) | v18+ | Bắt buộc |
| [MySQL](https://dev.mysql.com/downloads/) | v8.0+ | Bắt buộc |
| [Redis](https://redis.io) | v7+ | Bắt buộc (Windows dùng [Memurai](https://www.memurai.com/)) |
| pnpm | Latest | `npm install -g pnpm` |

---

## 🗄️ 1. Cài đặt Database (MySQL)

### Tạo database

Mở MySQL client (MySQL Workbench, HeidiSQL, hoặc terminal) và chạy:

```sql
CREATE DATABASE websitebanhangmini;
```

### Cấu hình kết nối

Mở file `be/.env` và điền thông tin MySQL của bạn:

```env
DB_USER=root
DB_PASSWORD=       # Mật khẩu MySQL của bạn
DB_NAME=websitebanhangmini
DB_HOST=127.0.0.1
DB_PORT=3306
```

---

## 🔧 2. Cài đặt & chạy Backend

```powershell
# Di chuyển vào thư mục backend
cd be

# Cài dependencies
pnpm install

# Chạy migration để tạo bảng
pnpm db:migrate

# Import dữ liệu mẫu (theo thứ tự)
node scripts/create-admin-user.js      # Tạo tài khoản admin
node scripts/import-hybrid-products.js # Import sản phẩm
node scripts/seed_news.js              # Import tin tức

# Khởi động server (development)
pnpm dev
```

> ✅ Backend chạy tại: `http://localhost:8888`  
> 📖 API Docs (Swagger): `http://localhost:8888/api-docs`

### Tài khoản Admin mặc định

| | |
|--|--|
| Email | `admin@example.com` |
| Mật khẩu | `Admin@123` |

---

## 🎨 3. Cài đặt & chạy Frontend

```powershell
# Di chuyển vào thư mục frontend
cd fe

# Cài dependencies
pnpm install

# Khởi động dev server
pnpm dev
```

> ✅ Frontend chạy tại: `http://localhost:5175`
