const pool = require("../db/db");

// GET semua kategori
const getAllKategori = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM kategori ORDER BY id_kategori",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST tambah kategori (admin only)
const createKategori = async (req, res) => {
  const { nama_kategori } = req.body;
  const { role } = req.query;

  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa menambah kategori" });
  }

  if (!nama_kategori) {
    return res.status(400).json({ message: "Nama kategori wajib diisi" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO kategori (nama_kategori) VALUES ($1) RETURNING *",
      [nama_kategori],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT update kategori (admin only)
const updateKategori = async (req, res) => {
  const { id } = req.params;
  const { nama_kategori } = req.body;
  const { role } = req.query;

  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa mengupdate kategori" });
  }

  if (!nama_kategori) {
    return res.status(400).json({ message: "Nama kategori wajib diisi" });
  }

  try {
    const result = await pool.query(
      "UPDATE kategori SET nama_kategori = $1, updated_at = CURRENT_TIMESTAMP WHERE id_kategori = $2 RETURNING *",
      [nama_kategori, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE kategori (admin only)
const deleteKategori = async (req, res) => {
  const { id } = req.params;
  const { role } = req.query;

  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa menghapus kategori" });
  }

  try {
    // Cek apakah kategori masih dipakai produk
    const cek = await pool.query(
      "SELECT * FROM produk WHERE id_kategori = $1",
      [id],
    );
    if (cek.rows.length > 0) {
      return res
        .status(400)
        .json({
          message: "Kategori masih memiliki produk, tidak bisa dihapus",
        });
    }

    const result = await pool.query(
      "DELETE FROM kategori WHERE id_kategori = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    res.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
};
