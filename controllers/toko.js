const pool = require("../db/db");

// GET semua toko
const getAllToko = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT t.*, p.nama as pemilik_nama, p.email 
            FROM toko t 
            JOIN pengguna p ON t.id_pengguna = p.id_pengguna 
            WHERE t.aktif = true
        `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Toko tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST buat toko (upgrade dari pembeli ke penjual)
const createToko = async (req, res) => {
  const { id_pengguna, nama_toko, deskripsi } = req.body;

  if (!id_pengguna || !nama_toko) {
    return res
      .status(400)
      .json({ message: "id_pengguna dan nama_toko wajib diisi" });
  }

  try {
    // Cek pengguna sudah punya toko atau belum
    const cekToko = await pool.query(
      "SELECT * FROM toko WHERE id_pengguna = $1",
      [id_pengguna],
    );
    if (cekToko.rows.length > 0) {
      return res.status(400).json({ message: "Pengguna sudah memiliki toko" });
    }

    // Update role pengguna menjadi penjual
    await pool.query("UPDATE pengguna SET role = $1 WHERE id_pengguna = $2", [
      "penjual",
      id_pengguna,
    ]);

    const result = await pool.query(
      "INSERT INTO toko (id_pengguna, nama_toko, deskripsi) VALUES ($1, $2, $3) RETURNING *",
      [id_pengguna, nama_toko, deskripsi],
    );
    res
      .status(201)
      .json({ message: "Toko berhasil dibuat", toko: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT update toko
const updateToko = async (req, res) => {
  const { id } = req.params;
  const { nama_toko, logo_toko, deskripsi } = req.body;
  try {
    const result = await pool.query(
      "UPDATE toko SET nama_toko = $1, logo_toko = $2, deskripsi = $3, updated_at = CURRENT_TIMESTAMP WHERE id_toko = $4 RETURNING *",
      [nama_toko, logo_toko, deskripsi, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Toko tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllToko,
  getTokoById,
  createToko,
  updateToko,
  getProdukByToko,
};
