const pool = require("../db/db");
const {
  success,
  error,
  notFound,
  forbidden,
} = require("../middleware/responseFormatter");

// GET semua transaksi (admin only) dengan PAGINATION
const getAllTransaksi = async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;

  if (role !== "admin") {
    return forbidden(res, "Hanya admin yang bisa melihat semua transaksi");
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const totalResult = await pool.query("SELECT COUNT(*) FROM transaksi");
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    const result = await pool.query(
      `
            SELECT t.*, p.id_pengguna, p.harga_akhir, p.status as pesanan_status
            FROM transaksi t
            JOIN pesanan p ON t.id_pesanan = p.id_pesanan
            ORDER BY t.created_at DESC
            LIMIT $1 OFFSET $2
        `,
      [parseInt(limit), offset],
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
      "Transactions retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET transaksi by ID (detail transaksi)
const getTransaksiById = async (req, res) => {
  const { id } = req.params;
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

    const items = await pool.query(
      `
            SELECT ip.*, pr.nama_produk
            FROM item_pesanan ip
            JOIN produk pr ON ip.id_produk = pr.id_produk
            WHERE ip.id_pesanan = $1
        `,
      [result.rows[0].id_pesanan],
    );

    return success(
      res,
      {
        transaksi: result.rows[0],
        items: items.rows,
      },
      "Transaction details retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET transaksi by pengguna (pembeli lihat transaksinya sendiri)
const getTransaksiByPengguna = async (req, res) => {
  const { id_pengguna } = req.params;
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
