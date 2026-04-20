const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");

// GET ulasan by produk
const getUlasanByProduk = async (req, res) => {
  const { id_produk } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT u.*, p.nama as pembeli_nama, p.url_foto as pembeli_foto
            FROM ulasan u
            JOIN pengguna p ON u.id_pengguna = p.id_pengguna
            WHERE u.id_produk = $1
            ORDER BY u.created_at DESC
        `,
      [id_produk],
    );

    const avgResult = await pool.query(
      "SELECT AVG(rating) as rata_rata FROM ulasan WHERE id_produk = $1",
      [id_produk],
    );

    return success(
      res,
      {
        ulasan: result.rows,
        total_ulasan: result.rows.length,
        rata_rating: parseFloat(avgResult.rows[0].rata_rata) || 0,
      },
      "Reviews retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST tambah ulasan
const createUlasan = async (req, res) => {
  const { id_pengguna, id_produk, id_pesanan, rating, komentar } = req.body;

  if (!id_pengguna || !id_produk || !id_pesanan || !rating) {
    return badRequest(res, "Field wajib diisi");
  }

  if (rating < 1 || rating > 5) {
    return badRequest(res, "Rating harus antara 1-5");
  }

  try {
    const cekPesanan = await pool.query(
      "SELECT status FROM pesanan WHERE id_pesanan = $1 AND id_pengguna = $2",
      [id_pesanan, id_pengguna],
    );
    if (cekPesanan.rows.length === 0) {
      return notFound(res, "Pesanan tidak ditemukan");
    }

    if (cekPesanan.rows[0].status !== "selesai") {
      return badRequest(
        res,
        "Ulasan hanya bisa diberikan untuk pesanan yang sudah selesai",
      );
    }

    const cekUlasan = await pool.query(
      "SELECT * FROM ulasan WHERE id_pengguna = $1 AND id_produk = $2 AND id_pesanan = $3",
      [id_pengguna, id_produk, id_pesanan],
    );
    if (cekUlasan.rows.length > 0) {
      return badRequest(
        res,
        "Anda sudah memberikan ulasan untuk produk ini di pesanan ini",
      );
    }

    const result = await pool.query(
      "INSERT INTO ulasan (id_pengguna, id_produk, id_pesanan, rating, komentar) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id_pengguna, id_produk, id_pesanan, rating, komentar],
    );

    const avgResult = await pool.query(
      "SELECT AVG(rating) as rata_rata FROM ulasan WHERE id_produk = $1",
      [id_produk],
    );
    await pool.query(
      "UPDATE produk SET rata_rating = $1 WHERE id_produk = $2",
      [avgResult.rows[0].rata_rata, id_produk],
    );

    return created(res, result.rows[0], "Ulasan berhasil ditambahkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE ulasan
const deleteUlasan = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM ulasan WHERE id_ulasan = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Ulasan tidak ditemukan");
    }

    const avgResult = await pool.query(
      "SELECT AVG(rating) as rata_rata FROM ulasan WHERE id_produk = $1",
      [result.rows[0].id_produk],
    );
    await pool.query(
      "UPDATE produk SET rata_rating = $1 WHERE id_produk = $2",
      [avgResult.rows[0].rata_rata, result.rows[0].id_produk],
    );

    return success(res, null, "Ulasan dihapus");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getUlasanByProduk,
  createUlasan,
  deleteUlasan,
};
