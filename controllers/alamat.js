const pool = require("../db/db");

// GET semua alamat by pengguna
const getAlamatByPengguna = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM alamat WHERE id_pengguna = $1 ORDER BY utama DESC, created_at DESC",
      [id_pengguna],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET alamat by ID
const getAlamatById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM alamat WHERE id_alamat = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Alamat tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST tambah alamat
const createAlamat = async (req, res) => {
  const { id_pengguna, nama_penerima, telepon, alamat, kota, kode_pos, utama } =
    req.body;

  if (!id_pengguna || !nama_penerima || !telepon || !alamat || !kota) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  try {
    // Jika utama = true, update alamat lain jadi false dulu
    if (utama) {
      await pool.query(
        "UPDATE alamat SET utama = false WHERE id_pengguna = $1",
        [id_pengguna],
      );
    }

    const result = await pool.query(
      "INSERT INTO alamat (id_pengguna, nama_penerima, telepon, alamat, kota, kode_pos, utama) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        id_pengguna,
        nama_penerima,
        telepon,
        alamat,
        kota,
        kode_pos,
        utama || false,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT update alamat
const updateAlamat = async (req, res) => {
  const { id } = req.params;
  const { nama_penerima, telepon, alamat, kota, kode_pos, utama } = req.body;

  try {
    // Jika utama = true, update alamat lain jadi false dulu
    if (utama) {
      const alamatLama = await pool.query(
        "SELECT id_pengguna FROM alamat WHERE id_alamat = $1",
        [id],
      );
      if (alamatLama.rows.length > 0) {
        await pool.query(
          "UPDATE alamat SET utama = false WHERE id_pengguna = $1",
          [alamatLama.rows[0].id_pengguna],
        );
      }
    }

    const result = await pool.query(
      "UPDATE alamat SET nama_penerima = COALESCE($1, nama_penerima), telepon = COALESCE($2, telepon), alamat = COALESCE($3, alamat), kota = COALESCE($4, kota), kode_pos = COALESCE($5, kode_pos), utama = COALESCE($6, utama), updated_at = CURRENT_TIMESTAMP WHERE id_alamat = $7 RETURNING *",
      [nama_penerima, telepon, alamat, kota, kode_pos, utama, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Alamat tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE alamat
const deleteAlamat = async (req, res) => {
  const { id } = req.params;
  try {
    // Cek apakah alamat ini sedang dipakai di pesanan
    const cek = await pool.query("SELECT * FROM pesanan WHERE id_alamat = $1", [
      id,
    ]);
    if (cek.rows.length > 0) {
      return res
        .status(400)
        .json({
          message: "Alamat sedang dipakai di pesanan, tidak bisa dihapus",
        });
    }

    const result = await pool.query(
      "DELETE FROM alamat WHERE id_alamat = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Alamat tidak ditemukan" });
    }
    res.json({ message: "Alamat berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAlamatByPengguna,
  getAlamatById,
  createAlamat,
  updateAlamat,
  deleteAlamat,
};
