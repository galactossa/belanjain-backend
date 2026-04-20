const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");

// GET semua settings
const getAllSettings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM settings ORDER BY id_setting",
    );
    return success(res, result.rows, "Settings retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET setting by key
const getSettingByKey = async (req, res) => {
  const { key } = req.params;
  try {
    const result = await pool.query("SELECT * FROM settings WHERE key = $1", [
      key,
    ]);
    if (result.rows.length === 0) {
      return notFound(res, "Setting tidak ditemukan");
    }
    return success(res, result.rows[0], "Setting retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST tambah setting baru
const createSetting = async (req, res) => {
  const { key, value, type } = req.body;

  if (!key) {
    return badRequest(res, "Key wajib diisi");
  }

  try {
    const cek = await pool.query("SELECT * FROM settings WHERE key = $1", [
      key,
    ]);
    if (cek.rows.length > 0) {
      return badRequest(res, "Key sudah ada");
    }

    const result = await pool.query(
      "INSERT INTO settings (key, value, type) VALUES ($1, $2, $3) RETURNING *",
      [key, value || "", type || "text"],
    );

    return created(res, result.rows[0], "Setting berhasil ditambahkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT update setting
const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  try {
    const result = await pool.query(
      "UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2 RETURNING *",
      [value, key],
    );

    if (result.rows.length === 0) {
      return notFound(res, "Setting tidak ditemukan");
    }

    return success(res, result.rows[0], "Setting berhasil diupdate");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE setting
const deleteSetting = async (req, res) => {
  const { key } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM settings WHERE key = $1 RETURNING *",
      [key],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Setting tidak ditemukan");
    }
    return success(res, null, "Setting berhasil dihapus");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
};
