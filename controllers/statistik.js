const pool = require("../db/db");

// GET statistik penjual
const getStatistikPenjual = async (req, res) => {
  const { id_toko } = req.params;

  try {
    // Total penjualan (dari pesanan yang sudah selesai)
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

    // Total produk terjual
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

    // Jumlah pesanan
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

    // Top 5 produk terlaris
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

    // Penjualan per bulan (6 bulan terakhir)
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

    res.json({
      total_penjualan: parseFloat(totalPenjualanResult.rows[0].total_penjualan),
      total_produk_terjual: parseInt(produkTerjualResult.rows[0].total_terjual),
      jumlah_pesanan: parseInt(jumlahPesananResult.rows[0].jumlah_pesanan),
      top_5_produk: topProdukResult.rows,
      penjualan_per_bulan: penjualanPerBulanResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET statistik admin (dashboard)
const getStatistikAdmin = async (req, res) => {
  const { role } = req.query;
  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa melihat statistik" });
  }

  try {
    // Jumlah user
    const jumlahUser = await pool.query("SELECT COUNT(*) FROM pengguna");

    // Jumlah penjual
    const jumlahPenjual = await pool.query(
      "SELECT COUNT(*) FROM pengguna WHERE role = $1",
      ["penjual"],
    );

    // Jumlah produk
    const jumlahProduk = await pool.query(
      "SELECT COUNT(*) FROM produk WHERE aktif = true",
    );

    // Total transaksi global
    const totalTransaksi = await pool.query(`
            SELECT COALESCE(SUM(p.harga_akhir), 0) as total
            FROM pesanan p
            WHERE p.status_pembayaran = 'sukses'
        `);

    // Jumlah pesanan
    const jumlahPesanan = await pool.query("SELECT COUNT(*) FROM pesanan");

    res.json({
      jumlah_user: parseInt(jumlahUser.rows[0].count),
      jumlah_penjual: parseInt(jumlahPenjual.rows[0].count),
      jumlah_produk: parseInt(jumlahProduk.rows[0].count),
      total_transaksi: parseFloat(totalTransaksi.rows[0].total),
      jumlah_pesanan: parseInt(jumlahPesanan.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getStatistikPenjual,
  getStatistikAdmin,
};
