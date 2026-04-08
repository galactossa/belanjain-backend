const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import semua routes
const penggunaRoutes = require("./routes/pengguna");
const alamatRoutes = require("./routes/alamat");
const tokoRoutes = require("./routes/toko");
const kategoriRoutes = require("./routes/kategori");
const produkRoutes = require("./routes/produk");
const wishlistRoutes = require("./routes/wishlist");
const keranjangRoutes = require("./routes/keranjang");
const voucherRoutes = require("./routes/voucher");
const pesananRoutes = require("./routes/pesanan");
const ulasanRoutes = require("./routes/ulasan");
const notifikasiRoutes = require("./routes/notifikasi");
const laporanRoutes = require("./routes/laporan");
const transaksiRoutes = require("./routes/transaksi");
const statistikRoutes = require("./routes/statistik");

// Gunakan routes
app.use("/api/pengguna", penggunaRoutes);
app.use("/api/alamat", alamatRoutes);
app.use("/api/toko", tokoRoutes);
app.use("/api/kategori", kategoriRoutes);
app.use("/api/produk", produkRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/keranjang", keranjangRoutes);
app.use("/api/voucher", voucherRoutes);
app.use("/api/pesanan", pesananRoutes);
app.use("/api/ulasan", ulasanRoutes);
app.use("/api/notifikasi", notifikasiRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/transaksi", transaksiRoutes);
app.use("/api/statistik", statistikRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "API BelanjaIn is running!",
    endpoints: {
      pengguna: "/api/pengguna",
      alamat: "/api/alamat",
      toko: "/api/toko",
      kategori: "/api/kategori",
      produk: "/api/produk",
      wishlist: "/api/wishlist",
      keranjang: "/api/keranjang",
      voucher: "/api/voucher",
      pesanan: "/api/pesanan",
      ulasan: "/api/ulasan",
      notifikasi: "/api/notifikasi",
      laporan: "/api/laporan",
      transaksi: "/api/transaksi",
      statistik: "/api/statistik",
    },
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
