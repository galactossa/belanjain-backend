const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");

// GET semua alamat by pengguna
const getAlamatByPengguna = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM alamat WHERE id_pengguna = $1 ORDER BY utama DESC, created_at DESC",
      [id_pengguna],
    );
    return success(res, result.rows, "Addresses retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
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
      return notFound(res, "Alamat tidak ditemukan");
    }
    return success(res, result.rows[0], "Address retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST tambah alamat
const createAlamat = async (req, res) => {
  const { id_pengguna, nama_penerima, telepon, alamat, kota, kode_pos, utama } =
    req.body;

  if (!id_pengguna || !nama_penerima || !telepon || !alamat || !kota) {
    return badRequest(res, "Semua field wajib diisi");
  }

  try {
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
    return created(res, result.rows[0], "Alamat berhasil ditambahkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT update alamat
const updateAlamat = async (req, res) => {
  const { id } = req.params;
  const { nama_penerima, telepon, alamat, kota, kode_pos, utama } = req.body;

  try {
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
      return notFound(res, "Alamat tidak ditemukan");
    }
    return success(res, result.rows[0], "Alamat berhasil diupdate");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE alamat
const deleteAlamat = async (req, res) => {
  const { id } = req.params;
  try {
    const cek = await pool.query("SELECT * FROM pesanan WHERE id_alamat = $1", [
      id,
    ]);
    if (cek.rows.length > 0) {
      return badRequest(
        res,
        "Alamat sedang dipakai di pesanan, tidak bisa dihapus",
      );
    }

    const result = await pool.query(
      "DELETE FROM alamat WHERE id_alamat = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Alamat tidak ditemukan");
    }
    return success(res, null, "Alamat berhasil dihapus");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getAlamatByPengguna,
  getAlamatById,
  createAlamat,
  updateAlamat,
  deleteAlamat,
};
