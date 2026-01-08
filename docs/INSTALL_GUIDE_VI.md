# Hướng Dẫn Cài Đặt Từ A - Z (Backend & Frontend)

Tài liệu này hướng dẫn chi tiết các bước để cài đặt và khởi chạy dự án Shopmini (bao gồm Backend và Frontend) trên môi trường phát triển cục bộ (Local Development).

---

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Node.js**: Phiên bản 18.x hoặc mới hơn.
- **Package Manager**: `npm` (đi kèm Node.js) hoặc `pnpm` (khuyên dùng).
- **PostgreSQL**: Phiên bản 14 hoặc mới hơn.
- **Redis**: Cần thiết cho bộ nhớ đệm (Cache) và chatbot.
- **Git**: Để quản lý mã nguồn.

---

## 🚀 Bước 1: Cài Đặt Backend (BE)

### 1.1. Cài đặt dependencies
Mở terminal và di chuyển vào thư mục `be`:
```bash
cd be
pnpm install
# hoặc npm install
```

### 1.2. Cấu hình biến môi trường (.env)
Tạo file `.env` trong thư mục `be` và cấu hình các thông số sau:

```env
NODE_ENV=development
PORT=8888
API_URL=http://localhost:8888

# Cấu hình Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=websitebanhangmini
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_SYNC=true # Đặt thành true ở lần chạy đầu tiên để tự động tạo bảng

# Cấu hình JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Cấu hình Email (SMTP - dùng để gửi mã xác thực)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@shopmini.com

# Cấu hình Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Cấu hình Gemini AI (Chatbot)
GEMINI_API_KEY=your_gemini_api_key

# Cấu hình Thanh Toán
STRIPE_SECRET_KEY=your_stripe_secret_key
SEPAY_API_KEY=your_sepay_api_key
```

### 1.3. Khởi tạo Database và Dữ liệu mẫu
Dự án cung cấp các script để thiết lập dữ liệu nhanh chóng:

1. **Khởi chạy server lần đầu** (để tạo cấu trúc bảng):
   ```bash
   pnpm start
   ```
   Sau khi thấy thông báo kết nối DB thành công, bạn có thể nhấn `Ctrl + C` để dừng.

2. **Tạo tài khoản Admin**:
   ```bash
   node scripts/create-admin-user.js
   ```
   *Mặc định: admin@example.com / Admin@123*

3. **Import dữ liệu sản phẩm mẫu**:
   ```bash
   node scripts/import-hybrid-products.js
   ```

### 1.4. Chạy Backend
```bash
pnpm dev
```
Backend sẽ chạy tại: `http://localhost:8888`

---

## 💻 Bước 2: Cài Đặt Frontend (FE)

### 2.1. Cài đặt dependencies
Mở terminal mới và di chuyển vào thư mục `fe`:
```bash
cd fe
pnpm install
# hoặc npm install
```

### 2.2. Cấu hình biến môi trường (.env)
Tạo file `.env` trong thư mục `fe`:

```env
VITE_API_URL=http://localhost:8888/api
VITE_BASE_URL=/

# Cấu hình Gemini AI cho Frontend (Nếu dùng trực tiếp từ FE)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Cấu hình Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=your_pk_test_key
```

### 2.3. Chạy Frontend
```bash
pnpm dev
```
Frontend sẽ chạy tại: `http://localhost:5173` (hoặc cổng khác tùy hệ thống).

---

## 🛠️ Debug và Các lỗi thường gặp

1. **Lỗi kết nối Database**: Kiểm tra xem PostgreSQL đã khởi động chưa và thông tin đăng nhập trong `.env` có chính xác không.
2. **Lỗi Redis**: Đảm bảo Redis server đang chạy (mặc định port 6379).
3. **Lỗi Chatbot (429 Too Many Requests)**: Đây là lỗi hết quota của Gemini API key. Bạn cần đổi sang API key mới hoặc đợi tài khoản được reset.
4. **Cors Error**: Đảm bảo `CORS_ORIGIN` trong backend `.env` chứa URL của frontend.

---

## 📖 Tài liệu bổ sung
Các tài liệu chi tiết khác có thể tìm thấy tại:
- `docs/PROJECT_STRUCTURE.md`: Cơ cấu thư mục.
- `docs/DATABASE_SETUP.md`: Chi tiết về các bảng dữ liệu.
- `docs/STRIPE_TEST_CARDS.md`: Thông tin thẻ test phục vụ thanh toán.
