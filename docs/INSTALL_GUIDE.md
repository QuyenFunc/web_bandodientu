# A-Z Installation Guide (Backend & Frontend)

This document provides detailed instructions for setting up and running the Shopmini project (both Backend and Frontend) in a local development environment.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: Version 18.x or newer.
- **Package Manager**: `npm` (included with Node.js) or `pnpm` (recommended).
- **PostgreSQL**: Version 14 or newer.
- **Redis**: Required for caching and chatbot functionality.
- **Git**: For source control.

---

## 🚀 Step 1: Backend Setup (BE)

### 1.1. Install dependencies
Open your terminal and navigate to the `be` directory:
```bash
cd be
pnpm install
# or npm install
```

### 1.2. Environment Variables (.env)
Create a `.env` file in the `be` folder and configure the following parameters:

```env
NODE_ENV=development
PORT=8888
API_URL=http://localhost:8888

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=websitebanhangmini
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_SYNC=true # Set to true on first run to automatically create tables

# JWT Configuration
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@shopmini.com

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Gemini AI Configuration (Chatbot)
GEMINI_API_KEY=your_gemini_api_key

# Payment Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
SEPAY_API_KEY=your_sepay_api_key
```

### 1.3. Initialize Database and Sample Data
The project provides scripts for rapid data setup:

1. **Run the server for the first time** (to create the table structure):
   ```bash
   pnpm start
   ```
   Once you see the DB connection success message, you can stop it with `Ctrl + C`.

2. **Create Admin User**:
   ```bash
   node scripts/create-admin-user.js
   ```
   *Default credentials: admin@example.com / Admin@123*

3. **Import Sample Products**:
   ```bash
   node scripts/import-hybrid-products.js
   ```

### 1.4. Run Backend
```bash
pnpm dev
```
The backend will run at: `http://localhost:8888`

---

## 💻 Step 2: Frontend Setup (FE)

### 2.1. Install dependencies
Open a new terminal and navigate to the `fe` directory:
```bash
cd fe
pnpm install
# or npm install
```

### 2.2. Environment Variables (.env)
Create a `.env` file in the `fe` folder:

```env
VITE_API_URL=http://localhost:8888/api
VITE_BASE_URL=/

# Gemini AI Configuration for Frontend
VITE_GEMINI_API_KEY=your_gemini_api_key

# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=your_pk_test_key
```

### 2.3. Run Frontend
```bash
pnpm dev
```
The frontend will run at: `http://localhost:5173` (or another port depending on your system).

---

## 🛠️ Troubleshooting

1. **Database Connection Error**: Verify PostgreSQL is running and credentials in `.env` are correct.
2. **Redis Error**: Ensure Redis server is active (default port 6379).
3. **Chatbot Error (429 Too Many Requests)**: This means your Gemini API key quota is exhausted. You'll need to use a new key or wait for the quota to reset.
4. **CORS Error**: Ensure `CORS_ORIGIN` in the backend `.env` includes your frontend URL.

---

## 📖 Additional Documentation
Further details can be found in:
- `docs/PROJECT_STRUCTURE.md`: Directory structure overview.
- `docs/DATABASE_SETUP.md`: Database schema details.
- `docs/STRIPE_TEST_CARDS.md`: Test card information for payments.
