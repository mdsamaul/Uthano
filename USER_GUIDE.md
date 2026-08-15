# UTHANO - User Guide

**From Farm to Family** - Fresh farm-to-home e-commerce marketplace.

---

## 📋 প্রজেক্ট স্ট্রাকচার

```
Uthano/
├── backend/    → Laravel 11 API (PHP)
└── frontend/   → Next.js 15 App (React/TypeScript)
```

---

## 🔧 প্রযুক্তি

| অংশ | প্রযুক্তি |
|------|-----------|
| Backend | Laravel 11, PHP 8.x, MySQL, Sanctum |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| State | Zustand, TanStack React Query |
| HTTP | Axios |

---

## 🚀 Backend Setup & Commands

### 1. ডিপেন্ডেন্সি ইনস্টল
```bash
cd backend
composer install
npm install
```

### 2. Environment কনফিগারেশন
```bash
# .env ফাইল তৈরি
copy .env.example .env

# App Key জেনারেট
php artisan key:generate
```

### 3. MySQL ডেটাবেস সেটআপ
`.env` ফাইলে নিচের কনফিগারেশন দিন:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=uthano
DB_USERNAME=root
DB_PASSWORD=
```

ডেটাবেস তৈরি:
```bash
# MySQL-এ লগইন করে ডেটাবেস তৈরি করুন
mysql -u root -p
CREATE DATABASE uthano CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. Migration & Seeder চালান
```bash
# সব টেবিল নতুন করে তৈরি + ডেমো ডেটা সিড
php artisan migrate:fresh --seed

# শুধু migration
php artisan migrate

# শুধু seeder
php artisan db:seed
```

### 5. Backend সার্ভার চালান
```bash
php artisan serve --host=127.0.0.1 --port=8000
```
✅ Backend চলবে: **http://127.0.0.1:8000**

### 6. দরকারি Artisan কমান্ড
```bash
# Route list দেখুন
php artisan route:list

# Cache clear
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Migration status
php artisan migrate:status

# Test চালান
php artisan test
```

---

## 🎨 Frontend Setup & Commands

### 1. ডিপেন্ডেন্সি ইনস্টল
```bash
cd frontend
npm install
```

### 2. Environment কনফিগারেশন (ঐচ্ছিক)
`.env.local` ফাইল তৈরি করুন (যদি API URL পরিবর্তন করতে চান):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
> ⚠️ ডিফল্ট API URL: `http://localhost:8000/api/v1` - ব্যাকএন্ডের সাথে মিলে যায়।

### 3. Frontend সার্ভার চালান
```bash
npm run dev
```
✅ Frontend চলবে: **http://localhost:3000**

### 4. দরকারি কমান্ড
```bash
# Production build
npm run build

# Production start
npm start

# TypeScript check
npm run typecheck

# Lint
npm run lint
```

---

## 🔗 Backend + Frontend সংযোগ

| সার্ভার | URL | পোর্ট |
|---------|-----|-------|
| Backend API | http://127.0.0.1:8000 | 8000 |
| Frontend | http://localhost:3000 | 3000 |

Frontend Axios client ডিফল্টভাবে `http://localhost:8000/api/v1` ব্যবহার করে। CORS ইতিমধ্যে কনফিগার করা আছে (Allow-Origin: *), তাই কোনো অতিরিক্ত সেটআপ লাগবে না।

---

## 👤 ডেমো ইউজার (Seeder থেকে)

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `superadmin@uthano.com` | `password` |
| **Admin** | `admin@uthano.com` | `password` |
| **Admin A (Product Manager)** | `admin-a@uthano.com` | `password` |
| **Admin B (Order Manager)** | `admin-b@uthano.com` | `password` |
| **Admin C (Delivery Manager)** | `admin-c@uthano.com` | `password` |
| **Staff** | `staff@uthano.com` | `password` |
| **Warehouse Manager** | `warehouse@uthano.com` | `password` |
| **Customer** | `customer@uthano.com` | `password` |
| **Farmer** | `farmer@uthano.com` | `password` |

**সরল রোল সিস্টেম:**
- `superadmin` - সব্রিদ অ্যাডমিন (সব অ্যাক্সেস)
- `admin` - অ্যাডমিন (সব CRUD অপারেশন)
- `staff` - স্টাফ (বেসিক CRUD)
- `warehouse_manager` - ওয়্যারহাউস ম্যানেজার
- `customer` - কাস্টমার
- `farmer` - ফার্মার

---

## 🗄️ Data Seeder (ডেমো ডেটা)

`php artisan migrate:fresh --seed` চালালে **DatabaseSeeder** সব ডেমো ডেটা স্বয়ংক্রিয়ভাবে তৈরি করে (RoleAndPermissionSeeder ও অটো-রান হয়)।

### Seeder ফাইলসমূহ

| ফাইল | কাজ |
|------|-----|
| `backend/database/seeders/DatabaseSeeder.php` | মূল seeder — সব ডেমো ডেটা |
| `backend/database/seeders/RoleAndPermissionSeeder.php` | Role + Permission সিড করে |

### Seeder যা তৈরি করে

- **৯টি ডেমো ইউজার** — superadmin, admin (৪টি), staff, warehouse_manager, customer, farmer
- **Customer Profile + Farmer + Farm** (Rahim Ahmed, Rahim Agro Farm)
- **Unit** — kg, pc, dz  |  **Category** — Fruits, Vegetables, Organic
- **২টি প্রোডাক্ট** — Fresh Mango, Fresh Guava
- **১টি Warehouse** — Jhenaidah Collection Center
- **Harvest + Harvest Batch + Inventory Item + Sourcing Record**
- **Delivery Zone** — Jhenaidah Sadar
- **৭টি Role + ৫৪টি Permission**

### Seeder চালানো / পুনরায় জেনারেট

```bash
# সব টেবিল নতুন করে + seeder চালান
php artisan migrate:fresh --seed

# শুধু seeder (DatabaseSeeder)
php artisan db:seed

# নির্দিষ্ট seeder
php artisan db:seed --class=RoleAndPermissionSeeder
```

### নতুন Seeder তৈরি করার নিয়ম

```bash
# 1. নতুন seeder ফাইল তৈরি করুন
php artisan make:seeder ProductSeeder

# 2. `database/seeders/DatabaseSeeder.php`-এর run() মেথডে নিবন্ধন করুন:
#    $this->call(ProductSeeder::class);

# 3. ডেটা সিড করার জন্য updateOrCreate() ব্যাবহার করুন (রিপিট সেফ):
#    Model::updateOrCreate(['unique_field' => 'value'], ['col' => 'data']);
```

---

## 🔐 সরল রোল-ভিত্তিক সিস্টেম

UTHANO এখন সরল রোল-ভিত্তিক অথেনটিকেশন সিস্টেম ব্যবহার করে। কোনো জটিল permission সিস্টেম নেই, শুধুমাত্র সহজ রোল চেকিং:

**রোল এবং অ্যাক্সেস:**
- `superadmin` - সব অ্যাক্সেস + ইউজার ম্যানেজমেন্ট
- `admin`, `staff`, `warehouse_manager` - সব CRUD অপারেশন 
- `customer` - কাস্টমার ফিচার (অর্ডার, প্রোফাইল)
- `farmer` - ফার্মার পোর্টাল অ্যাক্সেস

**ব্যাকেন্ড মিডেলওয়্যার:**
- `role:superadmin,admin,staff,warehouse_manager` - অ্যাডমিন রুট রক্ষা
- `role:farmer` - ফার্মার রুট রক্ষা
- `auth:sanctum` - লগইন রিকোয়ার্ড

---

## 📡 API Endpoints (মূল)

### Public
| Method | Endpoint | বিবরণ |
|--------|----------|-------|
| POST | `/api/v1/auth/login` | লগইন |
| POST | `/api/v1/auth/register` | রেজিস্ট্রেশন |
| GET | `/api/v1/products` | প্রোডাক্ট লিস্ট |
| GET | `/api/v1/products/{id or slug}` | প্রোডাক্ট ডিটেইল |
| GET | `/api/v1/categories` | ক্যাটাগরি লিস্ট |
| GET | `/api/v1/categories/{slug}` | ক্যাটাগরি ডিটেইল |

### Authenticated (Bearer Token)
| Method | Endpoint | বিবরণ |
|--------|----------|-------|
| GET | `/api/v1/auth/me` | বর্তমান ইউজার |
| POST | `/api/v1/auth/logout` | লগআউট |
| GET | `/api/v1/cart` | কার্ট |
| GET | `/api/v1/orders` | অর্ডার লিস্ট |
| POST | `/api/v1/orders` | অর্ডার তৈরি |

### Admin (role: superadmin, admin, staff, warehouse_manager)
| Method | Endpoint | বিবরণ |
|--------|----------|-------|
| GET | `/api/v1/admin/dashboard` | ড্যাশবোর্ড |
| GET | `/api/v1/admin/access/my` | বর্তমান ইউজার রোল |
| GET | `/api/v1/admin/products` | প্রোডাক্ট লিস্ট |
| POST | `/api/v1/admin/products` | প্রোডাক্ট তৈরি |
| PUT | `/api/v1/admin/products/{id}` | প্রোডাক্ট আপডেট |
| DELETE | `/api/v1/admin/products/{id}` | প্রোডাক্ট ডিলিট |
| GET | `/api/v1/admin/farmers` | ফার্মার লিস্ট |
| GET | `/api/v1/admin/inventory` | ইনভেন্টরি |

### Superadmin Only
| Method | Endpoint | বিবরণ |
|--------|----------|-------|
| GET | `/api/v1/admin/users` | ইউজার লিস্ট |
| POST | `/api/v1/admin/users` | ইউজার তৈরি |
| PUT | `/api/v1/admin/users/{id}` | ইউজার আপডেট |

---

## 🧪 দ্রুত টেস্ট (cURL)

### Login টেস্ট
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@uthano.com","password":"password"}'
```

### Products টেস্ট
```bash
curl http://127.0.0.1:8000/api/v1/products
```

---

## ⚠️ সাধারণ সমস্যা ও সমাধান

| সমস্যা | সমাধান |
|--------|--------|
| `Class "SQLite3" not found` | SQLite ব্যবহার না করে MySQL ব্যবহার করুন (উপরের গাইড) |
| `Access denied for user` | `.env`-এ সঠিক DB_USERNAME/DB_PASSWORD দিন |
| `Nothing to migrate` | `php artisan config:clear` তারপর `php artisan migrate:fresh --seed` |
| Port 8000 busy | `php artisan serve --port=8001` এবং frontend `.env.local`-এ URL আপডেট |
| CORS error | Backend ডিফল্ট CORS `*` অনুমোদিত, কোনো পরিবর্তন লাগবে না |

---

## 📝 নোট
- ডিফল্ট ডাটাবেস: **MySQL** (`uthano`)
- ডিফল্ট API prefix: `/api/v1`
- Authentication: **Laravel Sanctum** (Bearer Token)
- Frontend API base: `http://localhost:8000/api/v1`