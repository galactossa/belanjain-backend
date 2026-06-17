````markdown
# BelanjaIn Backend API

Backend untuk aplikasi e-commerce BelanjaIn. Dibangun dengan Node.js, Express.js, dan PostgreSQL.

---

## 📋 Daftar Isi

- [Cara Menjalankan](#-cara-menjalankan)
- [Format Response Standar](#-format-response-standar)
- [Daftar Endpoint API](#-daftar-endpoint-api)
- [Tech Stack](#-tech-stack)
- [Role dan Akses](#-role-dan-akses)
- [Catatan](#-catatan)

---

## 🚀 Cara Menjalankan

**1. Clone repository**

```bash
git clone https://github.com/galactossa/belanjain-backend.git
cd belanjain-backend
```
````

**2. Install dependencies**

```bash
npm install
```

**3. Setup environment variable**

Buat file `.env` di root folder:

```env
# Database Configuration (Local)
DB_USER=postgres
DB_PASSWORD=password_mu
DB_HOST=localhost
DB_PORT=5432
DB_NAME=BelanjaIn1

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT & Session
JWT_SECRET=rahasia_jwt_kamu_min_32_characters
SESSION_SECRET=rahasia_session_kamu_min_32_characters

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Biteship API (Ongkir) - Optional
BITESHIP_API_KEY=your_biteship_api_key
BITESHIP_BASE_URL=https://api.biteship.com/v1

# Komerce Payment API - Optional
KOMERCE_API_KEY=your_komerce_api_key
KOMERCE_BASE_URL=https://api-sandbox.collaborator.komerce.id/user
KOMERCE_PAYMENT_URL=https://pay-sandbox.komerce.id

# Cron Jobs (Optional)
API_BASE_URL=http://localhost:3000
DISCORD_WEBHOOK_URL=optional_discord_webhook_for_logging
```

**4. Setup Database**

```bash
# Import database dump
psql -U postgres -f BelanjaIn1.sql

# Atau buat database manual
createdb BelanjaIn1
psql -U postgres -d BelanjaIn1 -f BelanjaIn1.sql
```

**5. Jalankan server**

```bash
# Development mode (dengan auto-reload)
npm run dev

# Production mode
npm start
```

Server berjalan di: **http://localhost:3000**

---

## 📦 Format Response Standar

**Sukses (200/201):**

```json
{
  "status": "success",
  "data": { ... },
  "message": "Pesan sukses"
}
```

**Error (400/401/403/404/500):**

```json
{
  "status": "error",
  "data": null,
  "message": "Pesan error"
}
```

---

## 🔗 Daftar Endpoint API

### 🔐 Autentikasi (Pembeli)

**POST /api/pengguna/register** - Registrasi akun baru

```bash
# Request Body
{
  "nama": "Tora Eldoardo Eko Putra",
  "email": "tora@gmail.com",
  "password": "123456",
  "telepon": "08123456789"
}

# Response Sukses (201)
{
  "status": "success",
  "data": {
    "id_pengguna": 1,
    "nama": "Tora Eldoardo Eko Putra",
    "email": "tora@gmail.com",
    "role": "pembeli"
  },
  "message": "Registrasi berhasil"
}

# Response Error 400 (Email sudah terdaftar)
{
  "status": "error",
  "data": null,
  "message": "Email sudah terdaftar"
}
```

**POST /api/pengguna/login** - Login ke akun

```bash
# Request Body
{
  "email": "tora@gmail.com",
  "password": "123456"
}

# Response Sukses (200)
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "pengguna": {
      "id_pengguna": 1,
      "nama": "Tora Eldoardo Eko Putra",
      "email": "tora@gmail.com",
      "role": "pembeli",
      "telepon": "08123456789",
      "url_foto": null
    }
  },
  "message": "Login berhasil"
}

# Response Error 401 (Password salah)
{
  "status": "error",
  "data": null,
  "message": "Email atau password salah"
}

# Response Error 403 (Akun nonaktif)
{
  "status": "error",
  "data": null,
  "message": "Akun anda telah dinonaktifkan"
}
```

**GET /api/pengguna/me** - Get profile sendiri (butuh token)

```bash
# Header: Authorization: Bearer <token>

# Response Sukses (200)
{
  "status": "success",
  "data": {
    "id_pengguna": 1,
    "nama": "Tora Eldoardo Eko Putra",
    "email": "tora@gmail.com",
    "role": "pembeli",
    "telepon": "08123456789",
    "url_foto": null,
    "aktif": true,
    "created_at": "2026-06-15T22:45:04.771Z"
  }
}
```

---

### 🔑 Google OAuth

**GET /api/auth/google** - Redirect ke Google login

**GET /api/auth/google/callback** - Callback Google (redirect ke frontend dengan token)

**GET /api/auth/status** - Cek status login Google (butuh token)

**POST /api/auth/logout** - Logout Google

---

### 👤 Profil dan Alamat (Pembeli)

**PUT /api/pengguna/:id** - Edit profil (butuh token)

```bash
# Header: Authorization: Bearer <token>
# Request Body
{
  "nama": "Nama Baru",
  "telepon": "08123456789"
}

# Response Sukses (200)
{
  "status": "success",
  "data": {
    "id_pengguna": 1,
    "nama": "Nama Baru",
    "email": "tora@gmail.com",
    "telepon": "08123456789"
  },
  "message": "Data berhasil diupdate"
}
```

**POST /api/pengguna/:id/upload-foto** - Upload foto profil (butuh token)

```bash
# Header: Authorization: Bearer <token>
# Form-data: foto (file gambar)
```

**POST /api/alamat** - Tambah alamat (butuh token)

```bash
# Request Body
{
  "id_pengguna": 1,
  "nama_penerima": "Budi Santoso",
  "telepon": "08123456789",
  "alamat": "Jl. Merdeka No. 10",
  "kota": "Jakarta",
  "kode_pos": "10110",
  "utama": true
}

# Response Sukses (201)
{
  "status": "success",
  "data": { "id_alamat": 1, ... },
  "message": "Alamat berhasil ditambahkan"
}
```

**GET /api/alamat/pengguna/:id_pengguna** - Lihat semua alamat (butuh token)

**GET /api/alamat/:id** - Detail alamat (butuh token)

**PUT /api/alamat/:id** - Edit alamat (butuh token)

**DELETE /api/alamat/:id** - Hapus alamat (butuh token)

---

### 🏪 Manajemen Toko (Penjual)

**POST /api/toko** - Upgrade menjadi penjual (butuh token)

```bash
# Request Body
{
  "id_pengguna": 1,
  "nama_toko": "Toko Saya",
  "deskripsi": "Toko terpercaya"
}

# Response Sukses (201)
{
  "status": "success",
  "data": { "id_toko": 1, ... },
  "message": "Toko berhasil dibuat"
}
```

**PUT /api/toko/:id** - Edit profil toko (butuh token)

**GET /api/toko** - Lihat semua toko (public)

**GET /api/toko/:id** - Detail toko (public)

**GET /api/toko/:id_toko/produk** - Lihat produk toko (public)

**GET /api/toko/user/:userId** - Toko by user (butuh token)

**POST /api/toko/:id/upload-logo** - Upload logo toko (butuh token penjual/admin)

**POST /api/toko/:id/upload-banner** - Upload banner toko (butuh token penjual/admin)

---

### 📦 Produk

**GET /api/produk** - Lihat semua produk (public)

```bash
# Query Params (opsional)
?page=1&limit=12

# Response Sukses (200)
{
  "status": "success",
  "data": {
    "data": [
      {
        "id_produk": 1,
        "nama_produk": "MacBook Air M2",
        "harga": 18500000,
        "stok": 10,
        "rata_rating": 4.8,
        "total_terjual": 50,
        "nama_toko": "Toko Saya",
        "nama_kategori": "Elektronik"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 12,
      "total_data": 10,
      "total_page": 1,
      "has_next": false,
      "has_prev": false
    }
  },
  "message": "Products retrieved successfully"
}
```

**GET /api/produk/:id** - Detail produk (public)

```bash
# Response Sukses (200)
{
  "status": "success",
  "data": {
    "id_produk": 1,
    "nama_produk": "MacBook Air M2",
    "deskripsi": "Laptop tipis dan ringan",
    "harga": 18500000,
    "stok": 10,
    "rata_rating": 4.8,
    "total_terjual": 50,
    "nama_toko": "Toko Saya",
    "nama_kategori": "Elektronik"
  },
  "message": "Product retrieved successfully"
}

# Response Error 404
{
  "status": "error",
  "data": null,
  "message": "Produk tidak ditemukan"
}
```

**GET /api/produk/search?q=nama** - Cari produk (public)

**GET /api/produk/filter** - Filter produk (public)

```bash
# Query Params
?min_harga=100000&max_harga=500000&id_kategori=1&sort=harga_terendah

# Sort options: harga_terendah, harga_tertinggi, terlaris, rating_tertinggi
```

**GET /api/produk/suggestions?q=keyword** - Auto-suggest pencarian (public)

```bash
# Response Sukses (200)
{
  "status": "success",
  "data": [
    { "id_produk": 1, "nama_produk": "MacBook Air M2", "harga": 18500000, "url_gambar": "..." }
  ],
  "message": "Suggestions retrieved successfully"
}
```

**GET /api/produk/:id/trend** - Tren harga produk (naik/turun) (public)

**GET /api/produk/toko/:id_toko** - Produk by toko (public)

**GET /api/produk/kategori/:id_kategori** - Produk by kategori (public)

**POST /api/produk** - Tambah produk (penjual/admin, butuh token)

```bash
# Header: Authorization: Bearer <token>
# Request Body
{
  "id_toko": 1,
  "id_kategori": 1,
  "nama_produk": "Produk Baru",
  "deskripsi": "Deskripsi produk",
  "harga": 100000,
  "stok": 10
}

# Response Sukses (201)
{
  "status": "success",
  "data": { "id_produk": 1, ... },
  "message": "Produk berhasil ditambahkan"
}
```

**PUT /api/produk/:id** - Edit produk (penjual/admin, butuh token)

**DELETE /api/produk/:id** - Hapus produk (penjual/admin, butuh token)

**POST /api/produk/:id/upload-gambar** - Upload gambar produk (penjual/admin, butuh token)

**POST /api/produk/:id/galeri** - Tambah gambar galeri (penjual/admin, butuh token)

**GET /api/produk/:id/galeri** - Lihat galeri produk (public)

**DELETE /api/produk/galeri/:id_image** - Hapus gambar galeri (penjual/admin, butuh token)

---

### ❤️ Wishlist (butuh token)

**POST /api/wishlist** - Tambah ke wishlist

```bash
# Request Body
{
  "id_pengguna": 1,
  "id_produk": 1
}

# Response Sukses (201)
{
  "status": "success",
  "data": { "id_wishlist": 1, ... },
  "message": "Produk ditambahkan ke wishlist"
}

# Response Error 400 (Sudah ada)
{
  "status": "error",
  "data": null,
  "message": "Produk sudah ada di wishlist"
}
```

**GET /api/wishlist/pengguna/:id_pengguna** - Lihat wishlist

**GET /api/wishlist/cek/:id_pengguna/:id_produk** - Cek produk di wishlist

**DELETE /api/wishlist/:id_pengguna/:id_produk** - Hapus dari wishlist

---

### 🛒 Keranjang (butuh token)

**GET /api/keranjang/pengguna/:id_pengguna** - Lihat keranjang

```bash
# Response Sukses (200)
{
  "status": "success",
  "data": {
    "items": [
      {
        "id_keranjang": 1,
        "id_produk": 1,
        "jumlah": 2,
        "nama_produk": "MacBook Air M2",
        "harga_produk": 18500000,
        "url_gambar": "...",
        "stok_produk": 10,
        "nama_toko": "Toko Saya"
      }
    ],
    "total_items": 1,
    "total_harga": 37000000
  },
  "message": "Cart retrieved successfully"
}
```

**POST /api/keranjang** - Tambah ke keranjang

**PUT /api/keranjang/:id** - Update jumlah

**DELETE /api/keranjang/:id** - Hapus item

**DELETE /api/keranjang/pengguna/:id_pengguna/clear** - Kosongkan keranjang

---

### 📝 Pesanan dan Checkout

**POST /api/pesanan** - Checkout (butuh token)

```bash
# Request Body
{
  "id_pengguna": 1,
  "id_alamat": 1,
  "id_voucher": null,
  "metode_pembayaran": "transfer"
}

# Response Sukses (201)
{
  "status": "success",
  "data": {
    "id_pesanan": 1,
    "total_harga": 100000,
    "potongan_diskon": 0,
    "harga_akhir": 100000,
    "status": "menunggu",
    "status_pembayaran": "belum_bayar"
  },
  "message": "Pesanan berhasil dibuat"
}

# Response Error 400 (Keranjang kosong)
{
  "status": "error",
  "data": null,
  "message": "Keranjang kosong"
}
```

**GET /api/pesanan/pengguna/:id_pengguna** - Riwayat pesanan (butuh token)

**GET /api/pesanan/:id** - Detail pesanan dengan items (butuh token)

**GET /api/pesanan/toko/:id_toko** - Pesanan masuk toko (penjual/admin, butuh token)

**PUT /api/pesanan/:id/status** - Update status (penjual/admin, butuh token)

```bash
# Request Body
{
  "status": "diproses",
  "nomor_resi": "RESI123456"
}

# Status yang tersedia
# menunggu → diproses → dikirim → dalam_perjalanan → selesai
```

**PUT /api/pesanan/:id/pembayaran** - Update status pembayaran (butuh token)

---

### 🎫 Voucher

**GET /api/voucher** - Lihat semua voucher aktif (public)

**GET /api/voucher/:id** - Detail voucher (public)

**GET /api/voucher/kode/:kode** - Cek voucher by kode (public)

**GET /api/voucher/admin** - Lihat semua voucher termasuk nonaktif (admin, butuh token)

**POST /api/voucher** - Tambah voucher (admin, butuh token)

```bash
# Header: Authorization: Bearer <token>
# Request Body
{
  "kode": "RAMADAN10",
  "tipe_diskon": "persen",   # atau "nominal"
  "nilai_diskon": 10,
  "minimal_belanja": 100000,
  "maksimal_diskon": 50000,  # opsional
  "berlaku_dari": "2026-04-01",
  "berlaku_sampai": "2026-04-30"
}

# Response Sukses (201)
{
  "status": "success",
  "data": { "id_voucher": 1, ... },
  "message": "Voucher berhasil ditambahkan"
}
```

**PUT /api/voucher/:id** - Edit voucher (admin, butuh token)

**DELETE /api/voucher/:id** - Hapus voucher (admin, butuh token)

---

### ⭐ Review dan Rating

**POST /api/ulasan** - Tambah review (butuh token)

```bash
# Request Body
{
  "id_pengguna": 1,
  "id_produk": 1,
  "id_pesanan": 1,
  "rating": 5,
  "komentar": "Produk bagus!"
}

# Response Sukses (201)
{
  "status": "success",
  "data": { "id_ulasan": 1, ... },
  "message": "Ulasan berhasil ditambahkan"
}

# Response Error 400 (Sudah review)
{
  "status": "error",
  "data": null,
  "message": "Anda sudah memberikan ulasan untuk produk ini di pesanan ini"
}
```

**GET /api/ulasan/produk/:id_produk** - Lihat review produk (public)

**DELETE /api/ulasan/:id** - Hapus review (butuh token, hanya pemilik/admin)

---

### ✅ Trust Score

**GET /api/trust-score/produk/:id_produk** - Lihat trust score (public)

```bash
# Response Sukses (200)
{
  "status": "success",
  "data": {
    "id_produk": 1,
    "trust_score": 85,
    "level": "Sangat Terpercaya",
    "badge": "🏆",
    "detail": {
      "rating": 4.8,
      "rating_score": 96,
      "total_terjual": 50,
      "terjual_score": 50,
      "konsistensi_review": 90,
      "kecepatan_kirim": 85
    }
  },
  "message": "Trust score retrieved successfully"
}

# Level: Sangat Terpercaya (80+), Terpercaya (60-79), Cukup Terpercaya (40-59)
```

**GET /api/trust-score/semua** - Semua trust score (public)

---

### 💰 Rekomendasi Harga (Penjual)

**GET /api/rekomendasi/harga/:id_produk** - Rekomendasi harga optimal (butuh token penjual/admin)

```bash
# Header: Authorization: Bearer <token>

# Response Sukses (200)
{
  "status": "success",
  "data": {
    "id_produk": 8,
    "nama_produk": "MacBook Air M2",
    "harga_saat_ini": 18500000,
    "harga_optimal": 17000000,
    "statistik_penjualan": {
      "total_terjual": 50,
      "rata_rata_harga": 17500000,
      "harga_terendah": 16000000,
      "harga_tertinggi": 19000000,
      "persentil_25": 16800000,
      "persentil_75": 18200000
    },
    "stok": 10,
    "strategi": "Harga Kompetitif",
    "pertimbangan": "Harga Anda cukup kompetitif...",
    "rekomendasi": "Rp17.000.000"
  },
  "message": "Rekomendasi harga retrieved successfully"
}
```

---

### 📊 Simulasi Antrian Order (Admin)

**GET /api/simulasi/preview** - Preview data historis (butuh token admin)

**POST /api/simulasi/real-data** - Simulasi dengan data asli (butuh token admin)

```bash
# Request Body (opsional)
{
  "simulation_minutes": 480
}

# Response Sukses (200)
{
  "status": "success",
  "data": {
    "simulasi": {
      "total_orders_completed": 342,
      "simulation_minutes": 480,
      "throughput_per_hour": 43,
      "avg_waiting_time_minutes": 12.5,
      "avg_queue_length": 8.2,
      "seller_utilization": 78,
      "bottleneck": "Konfirmasi Penjual"
    },
    "data_historis": {
      "total_pesanan_dianalisis": 150,
      "rata_rata_order_per_jam": 25.5,
      "rata_rata_waktu_pembayaran_menit": 2.3,
      "rata_rata_waktu_konfirmasi_seller_menit": 4.8,
      "rata_rata_waktu_packing_menit": 3.2,
      "jumlah_seller_aktif": 8
    }
  },
  "message": "Simulasi dengan data asli berhasil"
}
```

**POST /api/simulasi/manual** - Simulasi dengan parameter manual (what-if) (butuh token admin)

---

### 🔔 Notifikasi

**GET /api/notifikasi/pengguna/:id_pengguna** - Lihat semua notifikasi (butuh token)

**GET /api/notifikasi/pengguna/:id_pengguna/unread** - Lihat notifikasi belum dibaca (butuh token)

**PUT /api/notifikasi/:id/read** - Tandai sudah dibaca (butuh token)

**PUT /api/notifikasi/pengguna/:id_pengguna/read-all** - Tandai semua sudah dibaca (butuh token)

**POST /api/notifikasi/broadcast** - Broadcast notifikasi ke semua pengguna (admin, butuh token)

```bash
# Header: Authorization: Bearer <token>
# Request Body
{
  "judul": "Promo Ramadhan",
  "pesan": "Diskon 50% untuk semua produk!",
  "tipe": "promo",
  "role": "semua"  # atau "pembeli", "penjual"
}

# Response Sukses (201)
{
  "status": "success",
  "data": { "total_recipients": 100 },
  "message": "Broadcast dikirim ke 100 pengguna"
}
```

---

### 📈 Statistik dan Dashboard

**GET /api/statistik/admin?role=admin** - Dashboard admin (butuh token admin)

```bash
# Response Sukses (200)
{
  "status": "success",
  "data": {
    "jumlah_user": 150,
    "jumlah_penjual": 20,
    "jumlah_produk": 500,
    "total_transaksi": 125000000,
    "jumlah_pesanan": 300
  },
  "message": "Admin statistics retrieved successfully"
}
```

**GET /api/statistik/penjual/:id_toko** - Dashboard penjual (butuh token)

```bash
# Response Sukses (200)
{
  "status": "success",
  "data": {
    "total_penjualan": 125000000,
    "total_produk_terjual": 342,
    "jumlah_pesanan": 150,
    "top_5_produk": [
      { "nama_produk": "MacBook Air M2", "total_terjual": 50 },
      { "nama_produk": "iPhone 15 Pro", "total_terjual": 30 }
    ],
    "penjualan_per_bulan": [
      { "bulan": "2026-03", "total_penjualan": 45000000 },
      { "bulan": "2026-04", "total_penjualan": 80000000 }
    ]
  },
  "message": "Seller statistics retrieved successfully"
}
```

---

### 📄 Laporan (Report System)

**POST /api/laporan** - Buat laporan (butuh token)

```bash
# Request Body
{
  "id_pelapor": 1,
  "tipe_target": "produk",  # atau "penjual"
  "id_target": 1,
  "alasan": "Produk tidak sesuai deskripsi"
}

# Response Sukses (201)
{
  "status": "success",
  "data": { "id_laporan": 1, ... },
  "message": "Laporan berhasil dibuat"
}
```

**GET /api/laporan/pelapor/:id_pelapor** - Lihat laporan sendiri (butuh token)

**GET /api/laporan?role=admin** - Lihat semua laporan (admin, butuh token)

**PUT /api/laporan/:id/status** - Validasi laporan (admin, butuh token)

```bash
# Request Body
{
  "status": "selesai",  # menunggu, diproses, selesai
  "catatan_admin": "Produk telah dinonaktifkan"
}
```

---

### 🏷️ Kategori (Admin)

**GET /api/kategori** - Lihat semua kategori (public)

**GET /api/kategori/:id** - Detail kategori (public)

**POST /api/kategori?role=admin** - Tambah kategori (admin, butuh token)

**PUT /api/kategori/:id?role=admin** - Edit kategori (admin, butuh token)

**DELETE /api/kategori/:id?role=admin** - Hapus kategori (admin, butuh token)

---

### 💳 Transaksi

**GET /api/transaksi?role=admin** - Lihat semua transaksi (admin, butuh token)

**GET /api/transaksi/pengguna/:id_pengguna** - Lihat transaksi sendiri (butuh token)

**GET /api/transaksi/:id** - Detail transaksi (butuh token, hanya pemilik/admin)

---

### 👥 Multi-Admin (Super Admin)

**GET /api/admin** - Lihat semua admin (admin, butuh token)

**POST /api/admin** - Tambah admin (admin, butuh token)

**PUT /api/admin/:id** - Edit admin (admin, butuh token)

**DELETE /api/admin/:id** - Hapus admin (admin, butuh token)

---

### ⚙️ System Settings (Super Admin)

**GET /api/settings** - Lihat semua pengaturan (public)

**GET /api/settings/:key** - Lihat by key (public)

**POST /api/settings** - Tambah setting (admin, butuh token)

**PUT /api/settings/:key** - Update setting (admin, butuh token)

**DELETE /api/settings/:key** - Hapus setting (admin, butuh token)

**POST /api/settings/upload-logo** - Upload logo perusahaan (admin, butuh token)

---

### 📝 Blog (Admin)

**GET /api/blogs** - Lihat semua artikel dengan pagination (public)

**GET /api/blogs/:id** - Detail artikel (public)

**POST /api/blogs** - Tambah artikel (admin, butuh token)

**PUT /api/blogs/:id** - Edit artikel (admin, butuh token)

**DELETE /api/blogs/:id** - Hapus artikel (admin, butuh token)

**POST /api/blogs/:id/upload-foto** - Upload foto artikel (admin, butuh token)

---

### 🔍 Search History (Pembeli)

**GET /api/search-history/pengguna/:id_pengguna** - Lihat riwayat (butuh token)

**POST /api/search-history** - Simpan keyword pencarian (butuh token)

**DELETE /api/search-history/:id** - Hapus satu (butuh token)

**DELETE /api/search-history/pengguna/:id_pengguna/clear** - Hapus semua (butuh token)

---

### 💎 Loyalty Points & Membership

**GET /api/loyalty/points/pengguna/:id_pengguna** - Total poin (butuh token)

**GET /api/loyalty/history/pengguna/:id_pengguna** - Riwayat poin (butuh token)

**GET /api/loyalty/membership/pengguna/:id_pengguna** - Level membership (butuh token)

```bash
# Response Sukses (200)
{
  "status": "success",
  "data": {
    "id_pengguna": 1,
    "total_points": 750,
    "membership_level": "Gold",
    "badge": "🥇",
    "min_points_for_current_level": 500,
    "points_to_next_level": 250,
    "next_level_name": "Platinum"
  },
  "message": "Membership level retrieved"
}
```

**POST /api/loyalty/points** - Tambah poin (butuh token)

**PUT /api/loyalty/points/redeem** - Tukar poin (butuh token)

**Level Membership:**
| Level | Points | Badge |
|-------|--------|-------|
| Regular | 0 - 499 | 🟢 |
| Gold | 500 - 999 | 🥇 |
| Platinum | 1000+ | 💎 |

---

### 💬 Chat (Real-time dengan Socket.io)

**GET /api/chat/rooms/:user_id** - Daftar chat rooms (butuh token)

**GET /api/chat/history/:user_id/:other_id** - Riwayat chat dengan pagination (butuh token)

**GET /api/chat/unread/:user_id** - Jumlah pesan belum dibaca (butuh token)

**DELETE /api/chat/:id** - Hapus pesan (butuh token)

**Aturan Chat:**

- Admin bisa chat dengan siapa saja
- Pembeli bisa langsung chat dengan penjual (untuk tanya sebelum beli)
- Penjual bisa chat dengan pembeli yang sudah pernah transaksi ATAU sudah pernah chat sebelumnya
- Penjual dengan penjual lain TIDAK BISA
- Pembeli dengan pembeli lain TIDAK BISA

**Socket.io Events:**

```javascript
// Client connect
socket.on("user-online", { user_id, role, name });

// Send message
socket.emit("send-message", {
  sender_id,
  sender_role,
  receiver_id,
  message,
  sender_name,
});

// Receive message
socket.on("new-message", (data) => {});

// Typing indicator
socket.emit("typing", { receiver_id, is_typing: true / false });

// Mark as read
socket.emit("mark-read", { message_ids, sender_id });
```

---

### 📦 Export Laporan (Admin)

**GET /api/export/penjualan/excel** - Export laporan penjualan ke Excel (admin, butuh token)

```bash
# Query Params
?start_date=2026-04-01&end_date=2026-04-30&status=selesai
```

**GET /api/export/penjualan/pdf** - Export laporan penjualan ke PDF (admin, butuh token)

**GET /api/export/produk-terlaris/excel** - Export produk terlaris ke Excel (admin, butuh token)

---

### 🚚 Ongkir (Biteship Integration)

**POST /api/ongkir/cost** - Cek ongkos kirim (butuh token)

```bash
# Request Body
{
  "origin_postal_code": "10110",
  "destination_postal_code": "60271",
  "couriers": "jne",
  "items": [
    { "name": "MacBook Air M2", "quantity": 1, "weight": 1500, "price": 18500000 }
  ]
}
```

**GET /api/ongkir/tracking/:tracking_id** - Cek status resi (butuh token)

**GET /api/ongkir/search-area?q=jakarta** - Cari area/kota (butuh token)

---

### 💳 Payment (Komerce Integration)

**GET /api/payment/methods** - Daftar metode pembayaran (butuh token)

**POST /api/payment/create** - Buat transaksi pembayaran (butuh token)

```bash
# Request Body (Virtual Account)
{
  "order_id": "ORD-001",
  "payment_type": "bank_transfer",
  "channel_code": "BCA",
  "amount": 100000,
  "customer_name": "Budi Santoso",
  "customer_email": "budi@email.com",
  "customer_phone": "08123456789",
  "items": [
    { "name": "Produk A", "quantity": 1, "price": 100000 }
  ]
}

# Request Body (QRIS)
{
  "order_id": "ORD-001",
  "payment_type": "qris",
  "amount": 100000,
  "customer_name": "Budi Santoso",
  "customer_email": "budi@email.com",
  "customer_phone": "08123456789",
  "items": [...]
}
```

**GET /api/payment/status/:payment_id** - Cek status pembayaran (butuh token)

**POST /api/payment/cancel/:payment_id** - Batalkan pembayaran (butuh token)

**POST /api/payment/webhook** - Webhook callback dari payment gateway (public)

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM/Driver:** pg (node-postgres)
- **Authentication:** JWT, Passport.js (Google OAuth)
- **File Upload:** Multer
- **Real-time:** Socket.io
- **External APIs:** Biteship (ongkir), Komerce (payment)
- **Environment:** dotenv

---

## 👥 Role dan Akses

| Role        | Akses                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| **Admin**   | Semua endpoint (kategori, voucher, transaksi, laporan, broadcast, blog, settings, multi-admin, simulasi, export) |
| **Penjual** | Kelola produk, lihat pesanan masuk, update status, rekomendasi harga, statistik toko                             |
| **Pembeli** | Belanja, wishlist, keranjang, pesanan, review, loyalty points, chat                                              |

---

## 📝 Catatan

- **Autentikasi:** Gunakan header `Authorization: Bearer <token>` untuk endpoint yang butuh autentikasi
- **Password:** Di-hash dengan bcrypt sebelum disimpan ke database
- **JWT:** Token berlaku 7 hari
- **Response:** Semua response mengikuti format standar `{ status, data, message }`
- **CORS:** Dikonfigurasi untuk menerima request dari frontend (`FRONTEND_URL` di .env)
- **Upload:** File gambar disimpan di folder `uploads/` dengan maksimal 5MB per file
- **Database:** Gunakan file `BelanjaIn1.sql` untuk import struktur dan data awal

---

## 📁 Struktur Folder

```
belanjain-backend/
├── config/           # Konfigurasi (passport.js)
├── controllers/      # Business logic
├── cron/             # Scheduled jobs
├── db/               # Database connection
├── middleware/       # Auth, upload, response formatter
├── routes/           # API route definitions
├── services/         # External API integrations
├── uploads/          # Uploaded files
├── .env              # Environment variables
├── package.json      # Dependencies
└── server.js         # Main entry point
```
