<h1>BelanjaIn Backend API</h1>
Backend untuk aplikasi e-commerce BelanjaIn. Dibangun dengan Node.js, Express.js, dan PostgreSQL.

<h2>Cara Menjalankan</h2>

1. Clone repository<br>
git clone https://github.com/galactossa/belanjain-backend.git<br>
cd belanjain-backend<br>

2. Install dependencies<br>
npm install<br>

3. Setup environment variable<br>
Buat file .env di root folder, isi dengan:<br>
DB_USER=postgres<br>
DB_PASSWORD=password_mu<br>
DB_HOST=localhost<br>
DB_PORT=5432<br>
DB_NAME=BelanjaIn<br>
PORT=3000<br>

4. Jalankan server<br>
npm run dev<br>

Server akan berjalan di http://localhost:3000

<h2>Daftar Endpoint API</h2>
<h3>Autentikasi (Pembeli)</h3>
POST /api/pengguna/register - Registrasi akun baru<br>
POST /api/pengguna/login - Login ke akun<br>

Contoh Request Register:<br>
{<br>
&nbsp;&nbsp;"nama": "Tora Eldoardo Eko Putra",<br>
&nbsp;&nbsp;"email": "tora@gmail.com",<br>
&nbsp;&nbsp;"password": "123456",<br>
&nbsp;&nbsp;"telepon": "08123456789"<br>
}<br>

Contoh Response Login:<br>
{<br>
&nbsp;&nbsp;"message": "Login berhasil",<br>
&nbsp;&nbsp;"pengguna": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"id_pengguna": 1,<br>
&nbsp;&nbsp;&nbsp;&nbsp;"nama": "Tora Eldoardo Eko Putra",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"email": "tora@gmail.com",<br>
&nbsp;&nbsp;&nbsp;&nbsp;"role": "pembeli"<br>
&nbsp;&nbsp;}<br>
}<br>

<h3>Profil dan Alamat (Pembeli)</h3>
PUT /api/pengguna/:id - Edit profil<br>
POST /api/alamat - Tambah alamat<br>
PUT /api/alamat/:id - Edit alamat<br>
DELETE /api/alamat/:id - Hapus alamat<br>
GET /api/alamat/pengguna/:id_pengguna - Lihat semua alamat<br>

<h3>Produk</h3>
GET /api/produk - Lihat semua produk (dengan pagination)<br>
GET /api/produk/:id - Lihat detail produk<br>
GET /api/produk/search?q=nama - Cari produk<br>
GET /api/produk/filter?min_harga=&max_harga=&sort= - Filter produk<br>
POST /api/produk - Tambah produk (penjual)<br>
PUT /api/produk/:id - Edit produk (penjual)<br>
DELETE /api/produk/:id - Hapus produk (penjual)<br>

Parameter Filter:<br>
- min_harga = harga minimal<br>
- max_harga = harga maksimal<br>
- id_kategori = filter by kategori<br>
- sort = harga_terendah, harga_tertinggi, terlaris, rating_tertinggi<br>

<h3>Wishlist</h3>
POST /api/wishlist - Tambah ke wishlist<br>
DELETE /api/wishlist/:id_pengguna/:id_produk - Hapus dari wishlist<br>
GET /api/wishlist/pengguna/:id_pengguna - Lihat wishlist<br>

<h3>Keranjang</h3>
POST /api/keranjang - Tambah ke keranjang<br>
PUT /api/keranjang/:id - Update jumlah<br>
DELETE /api/keranjang/:id - Hapus item<br>
DELETE /api/keranjang/pengguna/:id_pengguna/clear - Kosongkan keranjang<br>
GET /api/keranjang/pengguna/:id_pengguna - Lihat keranjang<br>

<h3>Pesanan dan Checkout</h3>
POST /api/pesanan - Checkout (buat pesanan)<br>
GET /api/pesanan/pengguna/:id_pengguna - Riwayat pesanan<br>
GET /api/pesanan/:id - Detail pesanan<br>
PUT /api/pesanan/:id/status - Update status pesanan<br>
PUT /api/pesanan/:id/pembayaran - Konfirmasi pembayaran<br>

Status Pesanan: menunggu -> diproses -> dikirim -> dalam_perjalanan -> selesai<br>

<h3>Voucher</h3>
GET /api/voucher - Lihat semua voucher aktif<br>
GET /api/voucher/kode/:kode - Cek voucher by kode<br>
POST /api/voucher - Tambah voucher (admin)<br>
PUT /api/voucher/:id - Edit voucher (admin)<br>
DELETE /api/voucher/:id - Hapus voucher (admin)<br>

<h3>Review dan Rating</h3>
POST /api/ulasan - Tambah review<br>
GET /api/ulasan/produk/:id_produk - Lihat review produk<br>
DELETE /api/ulasan/:id - Hapus review<br>

<h3>Trust Score</h3>
GET /api/trust-score/produk/:id_produk - Lihat trust score produk<br>
GET /api/trust-score/semua - Lihat semua trust score<br>

<h3>Notifikasi</h3>
GET /api/notifikasi/pengguna/:id_pengguna - Lihat notifikasi<br>
PUT /api/notifikasi/:id/read - Tandai sudah dibaca<br>
POST /api/notifikasi/broadcast - Kirim broadcast (admin)<br>

<h3>Statistik dan Dashboard</h3>
GET /api/statistik/admin - Dashboard admin<br>
GET /api/statistik/penjual/:id_toko - Dashboard penjual<br>

<h3>Manajemen Toko (Penjual)</h3>
POST /api/toko - Upgrade jadi penjual<br>
PUT /api/toko/:id - Edit profil toko<br>
GET /api/toko/:id/produk - Lihat produk toko<br>

<h3>Laporan (Report System)</h3>
POST /api/laporan - Buat laporan<br>
GET /api/laporan?role=admin - Lihat semua laporan (admin)<br>
PUT /api/laporan/:id/status - Validasi laporan (admin)<br>

<h3>Kategori (Admin)</h3>
GET /api/kategori - Lihat semua kategori<br>
POST /api/kategori?role=admin - Tambah kategori<br>
PUT /api/kategori/:id?role=admin - Edit kategori<br>
DELETE /api/kategori/:id?role=admin - Hapus kategori<br>

<h3>Transaksi (Admin)</h3>
GET /api/transaksi - Lihat semua transaksi<br>
GET /api/transaksi/:id - Detail transaksi<br>

<h2>Tech Stack</h2>
- Node.js<br>
- Express.js<br>
- PostgreSQL<br>
- pg (PostgreSQL driver)<br>
- dotenv<br>
- cors<br>

<h2>Role dan Akses</h2>
- Admin: Semua endpoint (kategori, voucher, transaksi, laporan, broadcast)<br>
- Penjual: Kelola produk, lihat pesanan masuk, update status<br>
- Pembeli: Belanja, wishlist, keranjang, pesanan, review<br>
