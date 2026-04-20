const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
  forbidden,
} = require("../middleware/responseFormatter");

// GET semua kategori
const getAllKategori = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM kategori ORDER BY id_kategori",
    );
    return success(res, result.rows, "Categories retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET kategori by ID
const getKategoriById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM kategori WHERE id_kategori = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Kategori tidak ditemukan");
    }
    return success(res, result.rows[0], "Category retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST tambah kategori (admin only)
const createKategori = async (req, res) => {
  const { nama_kategori } = req.body;
  const { role } = req.query;

  if (role !== "admin") {
    return forbidden(res, "Hanya admin yang bisa menambah kategori");
  }

  if (!nama_kategori) {
    return badRequest(res, "Nama kategori wajib diisi");
  }

  try {
    const result = await pool.query(
      "INSERT INTO kategori (nama_kategori) VALUES ($1) RETURNING *",
      [nama_kategori],
    );
    return created(res, result.rows[0], "Kategori berhasil ditambahkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT update kategori (admin only)
const updateKategori = async (req, res) => {
  const { id } = req.params;
  const { nama_kategori } = req.body;
  const { role } = req.query;

  if (role !== "admin") {
    return forbidden(res, "Hanya admin yang bisa mengupdate kategori");
  }

  if (!nama_kategori) {
    return badRequest(res, "Nama kategori wajib diisi");
  }

  try {
    const result = await pool.query(
      "UPDATE kategori SET nama_kategori = $1, updated_at = CURRENT_TIMESTAMP WHERE id_kategori = $2 RETURNING *",
      [nama_kategori, id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Kategori tidak ditemukan");
    }
    return success(res, result.rows[0], "Kategori berhasil diupdate");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE kategori (admin only)
const deleteKategori = async (req, res) => {
  const { id } = req.params;
  const { role } = req.query;

  if (role !== "admin") {
    return forbidden(res, "Hanya admin yang bisa menghapus kategori");
  }

  try {
    const cek = await pool.query(
      "SELECT * FROM produk WHERE id_kategori = $1",
      [id],
    );
    if (cek.rows.length > 0) {
      return badRequest(
        res,
        "Kategori masih memiliki produk, tidak bisa dihapus",
      );
    }

    const result = await pool.query(
      "DELETE FROM kategori WHERE id_kategori = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Kategori tidak ditemukan");
    }
    return success(res, null, "Kategori berhasil dihapus");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
};
