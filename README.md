<h1>BelanjaIn Backend API</h1>

<p>Backend untuk aplikasi e-commerce BelanjaIn. Dibangun dengan Node.js, Express.js, dan PostgreSQL.</p>

<hr>

<h2>Cara Menjalankan</h2>

<p><b>1. Clone repository</b></p>
<pre>
git clone https://github.com/galactossa/belanjain-backend.git
cd belanjain-backend
</pre>

<p><b>2. Install dependencies</b></p>
<pre>
npm install
</pre>

<p><b>3. Setup environment variable</b></p>
<p>Buat file <code>.env</code> di root folder:</p>
<pre>
DB_USER=postgres
DB_PASSWORD=password_mu
DB_HOST=localhost
DB_PORT=5432
DB_NAME=BelanjaIn
PORT=3000
JWT_SECRET=rahasia_jwt_kamu
</pre>

<p><b>4. Jalankan server</b></p>
<pre>
npm run dev
</pre>

<p>Server berjalan di: <b>http://localhost:3000</b></p>

<hr>

<h2>Format Response Standar</h2>

<p><b>Sukses (200/201):</b></p>
<pre>
{
  "status": "success",
  "data": { ... },
  "message": "Pesan sukses"
}
</pre>

<p><b>Error (400/401/403/404/500):</b></p>
<pre>
{
  "status": "error",
  "data": null,
  "message": "Pesan error"
}
</pre>

<hr>

<h2>Daftar Endpoint API</h2>

<h3>Autentikasi (Pembeli)</h3>

<p><b>POST /api/pengguna/register</b> - Registrasi akun baru</p>
<pre>
// Request Body
{
  "nama": "Tora Eldoardo Eko Putra",
  "email": "tora@gmail.com",
  "password": "123456",
  "telepon": "08123456789"
}

// Response Sukses (201)
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

// Response Error 400 (Email sudah terdaftar)
{
  "status": "error",
  "data": null,
  "message": "Email sudah terdaftar"
}
</pre>

<p><b>POST /api/pengguna/login</b> - Login ke akun</p>
<pre>
// Request Body
{
  "email": "tora@gmail.com",
  "password": "123456"
}

// Response Sukses (200)
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "pengguna": {
      "id_pengguna": 1,
      "nama": "Tora Eldoardo Eko Putra",
      "email": "tora@gmail.com",
      "role": "pembeli"
    }
  },
  "message": "Login berhasil"
}

// Response Error 401 (Password salah)
{
  "status": "error",
  "data": null,
  "message": "Email atau password salah"
}

// Response Error 403 (Akun nonaktif)
{
  "status": "error",
  "data": null,
  "message": "Akun anda telah dinonaktifkan"
}
</pre>

<hr>

<h3>Profil dan Alamat (Pembeli)</h3>

<p><b>PUT /api/pengguna/:id</b> - Edit profil (butuh token)</p>
<pre>
// Header: Authorization: Bearer &lt;token&gt;
// Request Body
{
  "nama": "Nama Baru",
  "telepon": "08123456789"
}

// Response Sukses (200)
{
  "status": "success",
  "data": {
    "id_pengguna": 1,
    "nama": "Nama Baru",
    "email": "tora@gmail.com"
  },
  "message": "Data berhasil diupdate"
}

// Response Error 401 (Token tidak ada)
{
  "status": "error",
  "data": null,
  "message": "Token tidak ditemukan"
}
</pre>

<p><b>POST /api/alamat</b> - Tambah alamat (butuh token)</p>
<pre>
// Request Body
{
  "id_pengguna": 1,
  "nama_penerima": "Budi Santoso",
  "telepon": "08123456789",
  "alamat": "Jl. Merdeka No. 10",
  "kota": "Jakarta",
  "kode_pos": "10110",
  "utama": true
}

// Response Sukses (201)
{
  "status": "success",
  "data": { "id_alamat": 1, ... },
  "message": "Alamat berhasil ditambahkan"
}
</pre>

<p><b>PUT /api/alamat/:id</b> - Edit alamat (butuh token)</p>
<p><b>DELETE /api/alamat/:id</b> - Hapus alamat (butuh token)</p>
<p><b>GET /api/alamat/pengguna/:id_pengguna</b> - Lihat semua alamat (butuh token)</p>

<hr>

<h3>Produk</h3>

<p><b>GET /api/produk</b> - Lihat semua produk (public)</p>
<pre>
// Response Sukses (200)
{
  "status": "success",
  "data": {
    "data": [
      { "id_produk": 1, "nama_produk": "MacBook Air M2", "harga": 18500000, ... }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 12,
      "total_data": 10,
      "total_page": 1
    }
  },
  "message": "Products retrieved successfully"
}
</pre>

<p><b>GET /api/produk/:id</b> - Detail produk (public)</p>
<pre>
// Response Sukses (200)
{
  "status": "success",
  "data": { "id_produk": 1, "nama_produk": "MacBook Air M2", ... },
  "message": "Product retrieved successfully"
}

// Response Error 404 (Produk tidak ditemukan)
{
  "status": "error",
  "data": null,
  "message": "Produk tidak ditemukan"
}
</pre>

<p><b>GET /api/produk/search?q=nama</b> - Cari produk (public)</p>
<p><b>GET /api/produk/filter?min_harga=&max_harga=&sort=</b> - Filter produk (public)</p>
<p><b>GET /api/produk/suggestions?q=keyword</b> - Auto-suggest (public)</p>

<p><b>POST /api/produk</b> - Tambah produk (penjual/admin, butuh token)</p>
<pre>
// Header: Authorization: Bearer &lt;token&gt;
// Request Body
{
  "id_toko": 1,
  "id_kategori": 1,
  "nama_produk": "Produk Baru",
  "deskripsi": "Deskripsi produk",
  "harga": 100000,
  "stok": 10
}

// Response Sukses (201)
{
  "status": "success",
  "data": { "id_produk": 1, ... },
  "message": "Produk berhasil ditambahkan"
}

// Response Error 403 (Bukan penjual/admin)
{
  "status": "error",
  "data": null,
  "message": "Akses ditolak. Hanya untuk: penjual, admin"
}
</pre>

<p><b>PUT /api/produk/:id</b> - Edit produk (penjual/admin, butuh token)</p>
<p><b>DELETE /api/produk/:id</b> - Hapus produk (penjual/admin, butuh token)</p>

<hr>

<h3>Wishlist (butuh token)</h3>

<p><b>POST /api/wishlist</b> - Tambah ke wishlist</p>
<pre>
// Request Body
{
  "id_pengguna": 1,
  "id_produk": 1
}

// Response Sukses (201)
{
  "status": "success",
  "data": { "id_wishlist": 1, ... },
  "message": "Produk ditambahkan ke wishlist"
}

// Response Error 400 (Sudah ada di wishlist)
{
  "status": "error",
  "data": null,
  "message": "Produk sudah ada di wishlist"
}
</pre>

<p><b>DELETE /api/wishlist/:id_pengguna/:id_produk</b> - Hapus dari wishlist</p>
<p><b>GET /api/wishlist/pengguna/:id_pengguna</b> - Lihat wishlist</p>

<hr>

<h3>Keranjang (butuh token)</h3>

<p><b>POST /api/keranjang</b> - Tambah ke keranjang</p>
<p><b>PUT /api/keranjang/:id</b> - Update jumlah</p>
<p><b>DELETE /api/keranjang/:id</b> - Hapus item</p>
<p><b>DELETE /api/keranjang/pengguna/:id_pengguna/clear</b> - Kosongkan keranjang</p>
<p><b>GET /api/keranjang/pengguna/:id_pengguna</b> - Lihat keranjang</p>

<hr>

<h3>Pesanan dan Checkout</h3>

<p><b>POST /api/pesanan</b> - Checkout (butuh token)</p>
<pre>
// Request Body
{
  "id_pengguna": 1,
  "id_alamat": 1,
  "id_voucher": null,
  "metode_pembayaran": "transfer"
}

// Response Sukses (201)
{
  "status": "success",
  "data": {
    "id_pesanan": 1,
    "total_harga": 100000,
    "potongan_diskon": 0,
    "harga_akhir": 100000,
    "status": "menunggu"
  },
  "message": "Pesanan berhasil dibuat"
}

// Response Error 400 (Keranjang kosong)
{
  "status": "error",
  "data": null,
  "message": "Keranjang kosong"
}
</pre>

<p><b>GET /api/pesanan/pengguna/:id_pengguna</b> - Riwayat pesanan (butuh token)</p>
<p><b>GET /api/pesanan/:id</b> - Detail pesanan (butuh token)</p>
<p><b>PUT /api/pesanan/:id/status</b> - Update status (penjual/admin, butuh token)</p>
<p><b>PUT /api/pesanan/:id/pembayaran</b> - Konfirmasi pembayaran (butuh token)</p>

<p><b>Status Pesanan:</b> menunggu → diproses → dikirim → dalam_perjalanan → selesai</p>

<hr>

<h3>Voucher</h3>

<p><b>GET /api/voucher</b> - Lihat semua voucher aktif (public)</p>
<p><b>GET /api/voucher/kode/:kode</b> - Cek voucher (public)</p>

<p><b>POST /api/voucher</b> - Tambah voucher (admin, butuh token)</p>
<pre>
// Header: Authorization: Bearer &lt;token&gt;
// Request Body
{
  "kode": "RAMADAN10",
  "tipe_diskon": "persen",
  "nilai_diskon": 10,
  "minimal_belanja": 100000,
  "berlaku_dari": "2026-04-01",
  "berlaku_sampai": "2026-04-30"
}

// Response Sukses (201)
{
  "status": "success",
  "data": { "id_voucher": 1, ... },
  "message": "Voucher berhasil ditambahkan"
}

// Response Error 403 (Bukan admin)
{
  "status": "error",
  "data": null,
  "message": "Hanya admin yang bisa menambah voucher"
}
</pre>

<p><b>PUT /api/voucher/:id</b> - Edit voucher (admin, butuh token)</p>
<p><b>DELETE /api/voucher/:id</b> - Hapus voucher (admin, butuh token)</p>

<hr>

<h3>Review dan Rating</h3>

<p><b>POST /api/ulasan</b> - Tambah review (butuh token)</p>
<pre>
// Request Body
{
  "id_pengguna": 1,
  "id_produk": 1,
  "id_pesanan": 1,
  "rating": 5,
  "komentar": "Produk bagus!"
}

// Response Sukses (201)
{
  "status": "success",
  "data": { "id_ulasan": 1, ... },
  "message": "Ulasan berhasil ditambahkan"
}

// Response Error 400 (Rating sudah diberikan)
{
  "status": "error",
  "data": null,
  "message": "Anda sudah memberikan ulasan untuk produk ini di pesanan ini"
}
</pre>

<p><b>GET /api/ulasan/produk/:id_produk</b> - Lihat review produk (public)</p>
<p><b>DELETE /api/ulasan/:id</b> - Hapus review (butuh token)</p>

<hr>

<h3>Trust Score</h3>

<p><b>GET /api/trust-score/produk/:id_produk</b> - Lihat trust score (public)</p>
<pre>
// Response Sukses (200)
{
  "status": "success",
  "data": {
    "id_produk": 1,
    "trust_score": 85,
    "level": "Terpercaya",
    "badge": "✅"
  },
  "message": "Trust score retrieved successfully"
}

// Response Error 404
{
  "status": "error",
  "data": null,
  "message": "Produk tidak ditemukan"
}
</pre>

<p><b>GET /api/trust-score/semua</b> - Semua trust score (public)</p>

<hr>

<h3>Notifikasi</h3>

<p><b>GET /api/notifikasi/pengguna/:id_pengguna</b> - Lihat notifikasi (butuh token)</p>
<p><b>PUT /api/notifikasi/:id/read</b> - Tandai dibaca (butuh token)</p>

<p><b>POST /api/notifikasi/broadcast</b> - Broadcast notifikasi (admin, butuh token)</p>
<pre>
// Header: Authorization: Bearer &lt;token&gt;
// Request Body
{
  "judul": "Promo Ramadhan",
  "pesan": "Diskon 50% untuk semua produk!",
  "tipe": "promo",
  "role": "semua"
}

// Response Sukses (201)
{
  "status": "success",
  "data": { "total_recipients": 100 },
  "message": "Broadcast dikirim ke 100 pengguna"
}
</pre>

<hr>

<h3>Statistik dan Dashboard</h3>

<p><b>GET /api/statistik/admin?role=admin</b> - Dashboard admin (butuh token admin)</p>
<pre>
// Response Sukses (200)
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

// Response Error 403
{
  "status": "error",
  "data": null,
  "message": "Hanya admin yang bisa melihat statistik"
}
</pre>

<p><b>GET /api/statistik/penjual/:id_toko</b> - Dashboard penjual (butuh token)</p>

<hr>

<h3>Manajemen Toko (Penjual)</h3>

<p><b>POST /api/toko</b> - Upgrade jadi penjual (butuh token)</p>
<p><b>PUT /api/toko/:id</b> - Edit profil toko (butuh token)</p>
<p><b>GET /api/toko/:id/produk</b> - Lihat produk toko (public)</p>

<hr>

<h3>Laporan (Report System)</h3>

<p><b>POST /api/laporan</b> - Buat laporan (butuh token)</p>
<pre>
// Request Body
{
  "id_pelapor": 1,
  "tipe_target": "produk",
  "id_target": 1,
  "alasan": "Produk tidak sesuai deskripsi"
}

// Response Sukses (201)
{
  "status": "success",
  "data": { "id_laporan": 1, ... },
  "message": "Laporan berhasil dibuat"
}
</pre>

<p><b>GET /api/laporan?role=admin</b> - Lihat semua laporan (admin, butuh token)</p>
<p><b>PUT /api/laporan/:id/status</b> - Validasi laporan (admin, butuh token)</p>

<hr>

<h3>Kategori (Admin)</h3>

<p><b>GET /api/kategori</b> - Lihat semua kategori (public)</p>
<p><b>POST /api/kategori?role=admin</b> - Tambah kategori (admin, butuh token)</p>
<p><b>PUT /api/kategori/:id?role=admin</b> - Edit kategori (admin, butuh token)</p>
<p><b>DELETE /api/kategori/:id?role=admin</b> - Hapus kategori (admin, butuh token)</p>

<hr>

<h3>Transaksi (Admin)</h3>

<p><b>GET /api/transaksi?role=admin</b> - Lihat semua transaksi (admin, butuh token)</p>
<p><b>GET /api/transaksi/:id</b> - Detail transaksi (butuh token)</p>

<hr>

<h3>Multi-Admin (Super Admin)</h3>

<p><b>GET /api/admin</b> - Lihat semua admin (admin, butuh token)</p>
<p><b>POST /api/admin</b> - Tambah admin (admin, butuh token)</p>
<p><b>PUT /api/admin/:id</b> - Edit admin (admin, butuh token)</p>
<p><b>DELETE /api/admin/:id</b> - Hapus admin (admin, butuh token)</p>

<hr>

<h3>System Settings (Super Admin)</h3>

<p><b>GET /api/settings</b> - Lihat semua pengaturan (public)</p>
<p><b>GET /api/settings/:key</b> - Lihat by key (public)</p>
<p><b>POST /api/settings</b> - Tambah setting (admin, butuh token)</p>
<p><b>PUT /api/settings/:key</b> - Update setting (admin, butuh token)</p>
<p><b>DELETE /api/settings/:key</b> - Hapus setting (admin, butuh token)</p>

<hr>

<h3>Blog (Admin)</h3>

<p><b>GET /api/blogs</b> - Lihat semua artikel (public)</p>
<p><b>GET /api/blogs/:id</b> - Detail artikel (public)</p>
<p><b>POST /api/blogs</b> - Tambah artikel (admin, butuh token)</p>
<p><b>PUT /api/blogs/:id</b> - Edit artikel (admin, butuh token)</p>
<p><b>DELETE /api/blogs/:id</b> - Hapus artikel (admin, butuh token)</p>

<hr>

<h3>Search History (Pembeli)</h3>

<p><b>GET /api/search-history/pengguna/:id_pengguna</b> - Lihat riwayat (butuh token)</p>
<p><b>POST /api/search-history</b> - Simpan keyword (butuh token)</p>
<p><b>DELETE /api/search-history/:id</b> - Hapus satu (butuh token)</p>
<p><b>DELETE /api/search-history/pengguna/:id_pengguna/clear</b> - Hapus semua (butuh token)</p>

<hr>

<h3>Loyalty Points & Membership</h3>

<p><b>GET /api/loyalty/points/pengguna/:id_pengguna</b> - Total poin (butuh token)</p>
<p><b>GET /api/loyalty/history/pengguna/:id_pengguna</b> - Riwayat poin (butuh token)</p>
<p><b>GET /api/loyalty/membership/pengguna/:id_pengguna</b> - Level membership (butuh token)</p>

<pre>
// Response Sukses (200)
{
  "status": "success",
  "data": {
    "id_pengguna": 1,
    "total_points": 750,
    "membership_level": "Gold",
    "badge": "🥇",
    "points_to_next_level": 250,
    "next_level_name": "Platinum"
  },
  "message": "Membership level retrieved"
}
</pre>

<p><b>POST /api/loyalty/points</b> - Tambah poin (butuh token)</p>
<p><b>PUT /api/loyalty/points/redeem</b> - Tukar poin (butuh token)</p>

<p><b>Level Membership:</b></p>
<ul>
  <li>Regular (0–499 poin) 🟢</li>
  <li>Gold (500–999 poin) 🥇</li>
  <li>Platinum (1000+ poin) 💎</li>
</ul>

<hr>

<h2>Tech Stack</h2>

<ul>
  <li>Node.js</li>
  <li>Express.js</li>
  <li>PostgreSQL</li>
  <li>pg (PostgreSQL driver)</li>
  <li>dotenv</li>
  <li>cors</li>
  <li>bcrypt (hash password)</li>
  <li>jsonwebtoken (JWT)</li>
</ul>

<hr>

<h2>Role dan Akses</h2>

<ul>
  <li><b>Admin:</b> Semua endpoint (kategori, voucher, transaksi, laporan, broadcast, blog, settings, multi-admin)</li>
  <li><b>Penjual:</b> Kelola produk, lihat pesanan masuk, update status</li>
  <li><b>Pembeli:</b> Belanja, wishlist, keranjang, pesanan, review, loyalty points</li>
</ul>

<hr>

<h2>Catatan</h2>

<ul>
  <li>Gunakan header untuk endpoint yang butuh autentikasi: <code>Authorization: Bearer &lt;token&gt;</code></li>
  <li>Password di-hash dengan bcrypt sebelum disimpan ke database</li>
  <li>Token JWT berlaku 7 hari</li>
  <li>Semua response mengikuti format standar: <code>{ status, data, message }</code></li>
</ul>
