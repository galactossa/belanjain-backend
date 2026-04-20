const pool = require("../db/db");

// GET semua settings
const getAllSettings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM settings ORDER BY id_setting",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Setting tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST tambah setting baru
const createSetting = async (req, res) => {
  const { key, value, type } = req.body;

  if (!key) {
    return res.status(400).json({ message: "Key wajib diisi" });
  }

  try {
    const cek = await pool.query("SELECT * FROM settings WHERE key = $1", [
      key,
    ]);
    if (cek.rows.length > 0) {
      return res.status(400).json({ message: "Key sudah ada" });
    }

    const result = await pool.query(
      "INSERT INTO settings (key, value, type) VALUES ($1, $2, $3) RETURNING *",
      [key, value || "", type || "text"],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Setting tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Setting tidak ditemukan" });
    }
    res.json({ message: "Setting berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
};
