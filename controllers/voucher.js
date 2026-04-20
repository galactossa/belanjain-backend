const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
  forbidden,
} = require("../middleware/responseFormatter");

// GET semua voucher aktif
const getAllVoucher = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT * FROM voucher 
            WHERE aktif = true 
            AND berlaku_dari <= CURRENT_DATE 
            AND berlaku_sampai >= CURRENT_DATE
            ORDER BY created_at DESC
        `);
    return success(res, result.rows, "Vouchers retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET semua voucher termasuk tidak aktif (admin only)
const getAllVoucherAdmin = async (req, res) => {
  const { role } = req.query;
  if (role !== "admin") {
    return forbidden(res, "Hanya admin yang bisa melihat semua voucher");
  }

  try {
    const result = await pool.query(
      "SELECT * FROM voucher ORDER BY created_at DESC",
    );
    return success(res, result.rows, "All vouchers retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET voucher by ID
const getVoucherById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM voucher WHERE id_voucher = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Voucher tidak ditemukan");
    }
    return success(res, result.rows[0], "Voucher retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET voucher by kode
const getVoucherByKode = async (req, res) => {
  const { kode } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT * FROM voucher 
            WHERE kode = $1 
            AND aktif = true 
            AND berlaku_dari <= CURRENT_DATE 
            AND berlaku_sampai >= CURRENT_DATE
        `,
      [kode],
    );

    if (result.rows.length === 0) {
      return notFound(res, "Voucher tidak valid atau sudah kadaluarsa");
    }
    return success(res, result.rows[0], "Voucher retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST tambah voucher (admin only)
const createVoucher = async (req, res) => {
  const {
    kode,
    tipe_diskon,
    nilai_diskon,
    minimal_belanja,
    maksimal_diskon,
    berlaku_dari,
    berlaku_sampai,
  } = req.body;
  const { role } = req.query;

  if (role !== "admin") {
    return forbidden(res, "Hanya admin yang bisa menambah voucher");
  }

  if (
    !kode ||
    !tipe_diskon ||
    !nilai_diskon ||
    !berlaku_dari ||
    !berlaku_sampai
  ) {
    return badRequest(res, "Field wajib diisi");
  }

  try {
    const cek = await pool.query("SELECT * FROM voucher WHERE kode = $1", [
      kode,
    ]);
    if (cek.rows.length > 0) {
      return badRequest(res, "Kode voucher sudah digunakan");
    }

    const result = await pool.query(
      "INSERT INTO voucher (kode, tipe_diskon, nilai_diskon, minimal_belanja, maksimal_diskon, berlaku_dari, berlaku_sampai) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        kode,
        tipe_diskon,
        nilai_diskon,
        minimal_belanja || 0,
        maksimal_diskon,
        berlaku_dari,
        berlaku_sampai,
      ],
    );
    return created(res, result.rows[0], "Voucher berhasil ditambahkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT update voucher (admin only)
const updateVoucher = async (req, res) => {
  const { id } = req.params;
  const {
    kode,
    tipe_diskon,
    nilai_diskon,
    minimal_belanja,
    maksimal_diskon,
    berlaku_dari,
    berlaku_sampai,
    aktif,
  } = req.body;
  const { role } = req.query;

  if (role !== "admin") {
    return forbidden(res, "Hanya admin yang bisa mengupdate voucher");
  }

  try {
    const result = await pool.query(
      "UPDATE voucher SET kode = $1, tipe_diskon = $2, nilai_diskon = $3, minimal_belanja = $4, maksimal_diskon = $5, berlaku_dari = $6, berlaku_sampai = $7, aktif = $8, updated_at = CURRENT_TIMESTAMP WHERE id_voucher = $9 RETURNING *",
      [
        kode,
        tipe_diskon,
        nilai_diskon,
        minimal_belanja,
        maksimal_diskon,
        berlaku_dari,
        berlaku_sampai,
        aktif,
        id,
      ],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Voucher tidak ditemukan");
    }
    return success(res, result.rows[0], "Voucher berhasil diupdate");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE voucher (admin only)
const deleteVoucher = async (req, res) => {
  const { id } = req.params;
  const { role } = req.query;

  if (role !== "admin") {
    return forbidden(res, "Hanya admin yang bisa menghapus voucher");
  }

  try {
    const cek = await pool.query(
      "SELECT * FROM pesanan WHERE id_voucher = $1",
      [id],
    );
    if (cek.rows.length > 0) {
      return badRequest(
        res,
        "Voucher sudah pernah dipakai, tidak bisa dihapus. Nonaktifkan saja.",
      );
    }

    const result = await pool.query(
      "DELETE FROM voucher WHERE id_voucher = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Voucher tidak ditemukan");
    }
    return success(res, null, "Voucher berhasil dihapus");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getAllVoucher,
  getAllVoucherAdmin,
  getVoucherById,
  getVoucherByKode,
  createVoucher,
  updateVoucher,
  deleteVoucher,
};
