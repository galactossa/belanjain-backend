const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");

// GET semua toko
const getAllToko = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT t.*, p.nama as pemilik_nama, p.email 
            FROM toko t 
            JOIN pengguna p ON t.id_pengguna = p.id_pengguna 
            WHERE t.aktif = true
        `);
    return success(res, result.rows, "Stores retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET toko by ID
const getTokoById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT t.*, p.nama as pemilik_nama, p.email 
            FROM toko t 
            JOIN pengguna p ON t.id_pengguna = p.id_pengguna 
            WHERE t.id_toko = $1
        `,
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Toko tidak ditemukan");
    }
    return success(res, result.rows[0], "Store retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST buat toko (upgrade dari pembeli ke penjual)
const createToko = async (req, res) => {
  const { id_pengguna, nama_toko, deskripsi } = req.body;

  if (!id_pengguna || !nama_toko) {
    return badRequest(res, "id_pengguna dan nama_toko wajib diisi");
  }

  try {
    const cekToko = await pool.query(
      "SELECT * FROM toko WHERE id_pengguna = $1",
      [id_pengguna],
    );
    if (cekToko.rows.length > 0) {
      return badRequest(res, "Pengguna sudah memiliki toko");
    }

    await pool.query("UPDATE pengguna SET role = $1 WHERE id_pengguna = $2", [
      "penjual",
      id_pengguna,
    ]);

    const result = await pool.query(
      "INSERT INTO toko (id_pengguna, nama_toko, deskripsi) VALUES ($1, $2, $3) RETURNING *",
      [id_pengguna, nama_toko, deskripsi],
    );
    return created(res, result.rows[0], "Toko berhasil dibuat");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT update toko
const updateToko = async (req, res) => {
  const { id } = req.params;
  const { nama_toko, logo_toko, deskripsi } = req.body;
  try {
    const result = await pool.query(
      "UPDATE toko SET nama_toko = COALESCE($1, nama_toko), logo_toko = COALESCE($2, logo_toko), deskripsi = COALESCE($3, deskripsi), updated_at = CURRENT_TIMESTAMP WHERE id_toko = $4 RETURNING *",
      [nama_toko, logo_toko, deskripsi, id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Toko tidak ditemukan");
    }
    return success(res, result.rows[0], "Toko berhasil diupdate");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET produk by toko
const getProdukByToko = async (req, res) => {
  const { id_toko } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM produk WHERE id_toko = $1 AND aktif = true",
      [id_toko],
    );
    return success(res, result.rows, "Products retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getAllToko,
  getTokoById,
  createToko,
  updateToko,
  getProdukByToko,
};
