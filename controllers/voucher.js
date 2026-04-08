const pool = require("../db/db");

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
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET semua voucher termasuk tidak aktif (admin only)
const getAllVoucherAdmin = async (req, res) => {
  const { role } = req.query;
  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa melihat semua voucher" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM voucher ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Voucher tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res
        .status(404)
        .json({ message: "Voucher tidak valid atau sudah kadaluarsa" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa menambah voucher" });
  }

  if (
    !kode ||
    !tipe_diskon ||
    !nilai_diskon ||
    !berlaku_dari ||
    !berlaku_sampai
  ) {
    return res.status(400).json({ message: "Field wajib diisi" });
  }

  try {
    // Cek kode sudah ada
    const cek = await pool.query("SELECT * FROM voucher WHERE kode = $1", [
      kode,
    ]);
    if (cek.rows.length > 0) {
      return res.status(400).json({ message: "Kode voucher sudah digunakan" });
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
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa mengupdate voucher" });
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
      return res.status(404).json({ message: "Voucher tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE voucher (admin only)
const deleteVoucher = async (req, res) => {
  const { id } = req.params;
  const { role } = req.query;

  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa menghapus voucher" });
  }

  try {
    // Cek apakah voucher pernah dipakai
    const cek = await pool.query(
      "SELECT * FROM pesanan WHERE id_voucher = $1",
      [id],
    );
    if (cek.rows.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "Voucher sudah pernah dipakai, tidak bisa dihapus. Nonaktifkan saja.",
        });
    }

    const result = await pool.query(
      "DELETE FROM voucher WHERE id_voucher = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Voucher tidak ditemukan" });
    }
    res.json({ message: "Voucher berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
