const pool = require("../db/db");

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

    // Hitung rata-rata rating
    const avgResult = await pool.query(
      "SELECT AVG(rating) as rata_rata FROM ulasan WHERE id_produk = $1",
      [id_produk],
    );

    res.json({
      ulasan: result.rows,
      total_ulasan: result.rows.length,
      rata_rating: parseFloat(avgResult.rows[0].rata_rata) || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST tambah ulasan
const createUlasan = async (req, res) => {
  const { id_pengguna, id_produk, id_pesanan, rating, komentar } = req.body;

  if (!id_pengguna || !id_produk || !id_pesanan || !rating) {
    return res.status(400).json({ message: "Field wajib diisi" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating harus antara 1-5" });
  }

  try {
    // Cek apakah pesanan sudah selesai
    const cekPesanan = await pool.query(
      "SELECT status FROM pesanan WHERE id_pesanan = $1 AND id_pengguna = $2",
      [id_pesanan, id_pengguna],
    );
    if (cekPesanan.rows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    if (cekPesanan.rows[0].status !== "selesai") {
      return res
        .status(400)
        .json({
          message:
            "Ulasan hanya bisa diberikan untuk pesanan yang sudah selesai",
        });
    }

    // Cek apakah sudah pernah review
    const cekUlasan = await pool.query(
      "SELECT * FROM ulasan WHERE id_pengguna = $1 AND id_produk = $2 AND id_pesanan = $3",
      [id_pengguna, id_produk, id_pesanan],
    );
    if (cekUlasan.rows.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Anda sudah memberikan ulasan untuk produk ini di pesanan ini",
        });
    }

    const result = await pool.query(
      "INSERT INTO ulasan (id_pengguna, id_produk, id_pesanan, rating, komentar) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id_pengguna, id_produk, id_pesanan, rating, komentar],
    );

    // Update rata-rata rating produk
    const avgResult = await pool.query(
      "SELECT AVG(rating) as rata_rata FROM ulasan WHERE id_produk = $1",
      [id_produk],
    );
    await pool.query(
      "UPDATE produk SET rata_rating = $1 WHERE id_produk = $2",
      [avgResult.rows[0].rata_rata, id_produk],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Ulasan tidak ditemukan" });
    }

    // Update rata-rata rating produk
    const avgResult = await pool.query(
      "SELECT AVG(rating) as rata_rata FROM ulasan WHERE id_produk = $1",
      [result.rows[0].id_produk],
    );
    await pool.query(
      "UPDATE produk SET rata_rating = $1 WHERE id_produk = $2",
      [avgResult.rows[0].rata_rata, result.rows[0].id_produk],
    );

    res.json({ message: "Ulasan dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUlasanByProduk,
  createUlasan,
  deleteUlasan,
};
