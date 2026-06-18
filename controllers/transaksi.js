const pool = require("../db/db");
const {
  success,
  error,
  notFound,
  forbidden,
} = require("../middleware/responseFormatter");

// ================= GET SEMUA TRANSAKSI UNTUK ADMIN =================
const getAllTransaksi = async (req, res) => {
  // 🔥 PERBAIKI: Hapus validasi role dari query (sudah dicek di middleware)
  // const { role } = req.query;  // ❌ HAPUS INI
  // if (role !== "admin") { ... } // ❌ HAPUS INI

  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    // 🔥 Ambil dari transaksi + JOIN pesanan + JOIN pengguna
    const result = await pool.query(
      `
      SELECT 
        t.id_transaksi,
        t.id_pesanan,
        t.metode_pembayaran,
        t.jumlah_dibayar,
        t.status_pembayaran,
        t.waktu_pembayaran,
        t.created_at,
        p.harga_akhir,
        p.status as pesanan_status,
        u.id_pengguna,
        u.nama as pembeli_nama,
        u.email as pembeli_email
      FROM transaksi t
      JOIN pesanan p ON t.id_pesanan = p.id_pesanan
      JOIN pengguna u ON p.id_pengguna = u.id_pengguna
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2
    `,
      [parseInt(limit), offset],
    );

    // Hitung total
    const totalResult = await pool.query("SELECT COUNT(*) FROM transaksi");
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    let data = result.rows;

    // 🔥 Jika tidak ada transaksi, ambil dari pesanan yang sudah dibayar
    if (data.length === 0) {
      console.log(
        "⚠️ Tidak ada transaksi, ambil dari pesanan yang sudah dibayar...",
      );

      const fallbackResult = await pool.query(
        `
        SELECT 
          p.id_pesanan as id_transaksi,
          p.id_pesanan,
          p.metode_pembayaran,
          p.harga_akhir as jumlah_dibayar,
          p.status_pembayaran,
          p.updated_at as waktu_pembayaran,
          p.created_at,
          p.harga_akhir,
          p.status as pesanan_status,
          u.id_pengguna,
          u.nama as pembeli_nama,
          u.email as pembeli_email
        FROM pesanan p
        JOIN pengguna u ON p.id_pengguna = u.id_pengguna
        WHERE p.status_pembayaran = 'sukses' 
           OR p.status = 'diproses' 
           OR p.status = 'selesai'
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `,
        [parseInt(limit), offset],
      );

      data = fallbackResult.rows;
    }

    return success(
      res,
      {
        data: data,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total_data: data.length,
          total_page: Math.ceil(data.length / parseInt(limit)),
        },
      },
      "Transactions retrieved successfully",
    );
  } catch (err) {
    console.error("❌ Error getAllTransaksi:", err);
    return error(res, "Server error", 500);
  }
};

// GET transaksi by ID
const getTransaksiById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    const result = await pool.query(
      `
      SELECT t.*, 
             p.id_pengguna, 
             p.total_harga, 
             p.potongan_diskon, 
             p.harga_akhir, 
             p.status as pesanan_status,
             p.metode_pembayaran,
             p.nomor_resi,
             u.nama as pembeli_nama,
             u.email as pembeli_email
      FROM transaksi t
      JOIN pesanan p ON t.id_pesanan = p.id_pesanan
      JOIN pengguna u ON p.id_pengguna = u.id_pengguna
      WHERE t.id_transaksi = $1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return notFound(res, "Transaksi tidak ditemukan");
    }

    const transaksi = result.rows[0];
    if (transaksi.id_pengguna !== userId && userRole !== "admin") {
      return forbidden(res, "Anda tidak memiliki akses ke transaksi ini");
    }

    const items = await pool.query(
      `
      SELECT ip.*, pr.nama_produk
      FROM item_pesanan ip
      JOIN produk pr ON ip.id_produk = pr.id_produk
      WHERE ip.id_pesanan = $1
    `,
      [transaksi.id_pesanan],
    );

    return success(
      res,
      {
        transaksi: transaksi,
        items: items.rows,
      },
      "Transaction details retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET transaksi by pengguna
const getTransaksiByPengguna = async (req, res) => {
  const { id_pengguna } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (parseInt(id_pengguna) !== userId && userRole !== "admin") {
    return forbidden(res, "Anda hanya bisa melihat transaksi sendiri");
  }

  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const totalResult = await pool.query(
      `
      SELECT COUNT(*) FROM transaksi t
      JOIN pesanan p ON t.id_pesanan = p.id_pesanan
      WHERE p.id_pengguna = $1
    `,
      [id_pengguna],
    );
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    const result = await pool.query(
      `
      SELECT t.*, p.harga_akhir, p.status as pesanan_status
      FROM transaksi t
      JOIN pesanan p ON t.id_pesanan = p.id_pesanan
      WHERE p.id_pengguna = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [id_pengguna, parseInt(limit), offset],
    );

    return success(
      res,
      {
        data: result.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total_data: totalData,
          total_page: totalPage,
        },
      },
      "User transactions retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getAllTransaksi,
  getTransaksiById,
  getTransaksiByPengguna,
};
