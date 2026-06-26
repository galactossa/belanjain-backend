const pool = require("../db/db");
const {
  success,
  error,
  forbidden,
} = require("../middleware/responseFormatter");

// GET statistik penjual
const getStatistikPenjual = async (req, res) => {
  const { id_toko } = req.params;

  try {
    const totalPenjualanResult = await pool.query(
      `
      SELECT COALESCE(SUM(ip.jumlah * ip.harga), 0) as total_penjualan
      FROM item_pesanan ip
      JOIN pesanan p ON ip.id_pesanan = p.id_pesanan
      JOIN produk pr ON ip.id_produk = pr.id_produk
      WHERE pr.id_toko = $1 AND p.status = 'selesai'
      `,
      [id_toko],
    );

    const produkTerjualResult = await pool.query(
      `
      SELECT COALESCE(SUM(ip.jumlah), 0) as total_terjual
      FROM item_pesanan ip
      JOIN pesanan p ON ip.id_pesanan = p.id_pesanan
      JOIN produk pr ON ip.id_produk = pr.id_produk
      WHERE pr.id_toko = $1 AND p.status = 'selesai'
      `,
      [id_toko],
    );

    const jumlahPesananResult = await pool.query(
      `
      SELECT COUNT(DISTINCT p.id_pesanan) as jumlah_pesanan
      FROM pesanan p
      JOIN item_pesanan ip ON p.id_pesanan = ip.id_pesanan
      JOIN produk pr ON ip.id_produk = pr.id_produk
      WHERE pr.id_toko = $1
      `,
      [id_toko],
    );

    const topProdukResult = await pool.query(
      `
      SELECT pr.nama_produk, COALESCE(SUM(ip.jumlah), 0) as total_terjual
      FROM produk pr
      LEFT JOIN item_pesanan ip ON pr.id_produk = ip.id_produk
      LEFT JOIN pesanan p ON ip.id_pesanan = p.id_pesanan AND p.status = 'selesai'
      WHERE pr.id_toko = $1
      GROUP BY pr.id_produk, pr.nama_produk
      ORDER BY total_terjual DESC
      LIMIT 5
      `,
      [id_toko],
    );

    const penjualanPerBulanResult = await pool.query(
      `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', p.created_at), 'YYYY-MM') as bulan,
        COALESCE(SUM(ip.jumlah * ip.harga), 0) as total_penjualan
      FROM pesanan p
      JOIN item_pesanan ip ON p.id_pesanan = ip.id_pesanan
      JOIN produk pr ON ip.id_produk = pr.id_produk
      WHERE pr.id_toko = $1 AND p.status = 'selesai'
      GROUP BY DATE_TRUNC('month', p.created_at)
      ORDER BY DATE_TRUNC('month', p.created_at) DESC
      LIMIT 6
      `,
      [id_toko],
    );

    return success(
      res,
      {
        total_penjualan: parseFloat(
          totalPenjualanResult.rows[0].total_penjualan,
        ),
        total_produk_terjual: parseInt(
          produkTerjualResult.rows[0].total_terjual,
        ),
        jumlah_pesanan: parseInt(jumlahPesananResult.rows[0].jumlah_pesanan),
        top_5_produk: topProdukResult.rows,
        penjualan_per_bulan: penjualanPerBulanResult.rows,
      },
      "Seller statistics retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// ================= 🔥 GET STATISTIK ADMIN (DIPERBAIKI) =================
const getStatistikAdmin = async (req, res) => {
  console.log("🔍 getStatistikAdmin called, req.user:", req.user);

  // 🔥 PERBAIKAN: Cek role dari req.user (token), BUKAN dari query
  if (!req.user || req.user.role !== "admin") {
    return forbidden(res, "Hanya admin yang bisa melihat statistik");
  }

  try {
    // 🔥 JUMLAH USER
    const jumlahUser = await pool.query("SELECT COUNT(*) FROM pengguna");

    // 🔥 JUMLAH PENJUAL
    const jumlahPenjual = await pool.query(
      "SELECT COUNT(*) FROM pengguna WHERE role = 'penjual'",
    );

    // 🔥 JUMLAH PRODUK
    const jumlahProduk = await pool.query(
      "SELECT COUNT(*) FROM produk WHERE aktif = true",
    );

    // 🔥 JUMLAH PESANAN
    const jumlahPesanan = await pool.query("SELECT COUNT(*) FROM pesanan");

    // 🔥 TOTAL TRANSAKSI (PENDAPATAN)
    const totalTransaksi = await pool.query(
      "SELECT COALESCE(SUM(harga_akhir), 0) as total FROM pesanan WHERE status = 'selesai' OR status_pembayaran = 'sukses'",
    );

    // 🔥 PESANAN MENUNGGU
    const pesananMenunggu = await pool.query(
      "SELECT COUNT(*) FROM pesanan WHERE status = 'menunggu'",
    );

    // 🔥 PESANAN SELESAI
    const pesananSelesai = await pool.query(
      "SELECT COUNT(*) FROM pesanan WHERE status = 'selesai'",
    );

    // 🔥 RATA-RATA RATING
    const rataRating = await pool.query(
      "SELECT COALESCE(AVG(rating), 0) as rata FROM ulasan",
    );

    const data = {
      jumlah_user: parseInt(jumlahUser.rows[0].count) || 0,
      jumlah_penjual: parseInt(jumlahPenjual.rows[0].count) || 0,
      jumlah_produk: parseInt(jumlahProduk.rows[0].count) || 0,
      jumlah_pesanan: parseInt(jumlahPesanan.rows[0].count) || 0,
      total_transaksi: parseFloat(totalTransaksi.rows[0].total) || 0,
      pesanan_menunggu: parseInt(pesananMenunggu.rows[0].count) || 0,
      pesanan_selesai: parseInt(pesananSelesai.rows[0].count) || 0,
      rata_rata_rating: parseFloat(rataRating.rows[0].rata) || 0,
    };

    console.log("📊 Admin stats data:", data);

    return success(res, data, "Admin statistics retrieved successfully");
  } catch (err) {
    console.error("❌ Error fetching admin stats:", err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getStatistikPenjual,
  getStatistikAdmin,
};
