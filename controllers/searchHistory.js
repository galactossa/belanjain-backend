const pool = require("../db/db");

// GET riwayat pencarian by pengguna
const getSearchHistory = async (req, res) => {
  const { id_pengguna } = req.params;
  const { limit = 10 } = req.query;

  try {
    const result = await pool.query(
      "SELECT * FROM search_history WHERE id_pengguna = $1 ORDER BY created_at DESC LIMIT $2",
      [id_pengguna, parseInt(limit)],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST simpan keyword pencarian
const saveSearchHistory = async (req, res) => {
  const { id_pengguna, keyword } = req.body;

  if (!id_pengguna || !keyword) {
    return res
      .status(400)
      .json({ message: "id_pengguna dan keyword wajib diisi" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO search_history (id_pengguna, keyword) VALUES ($1, $2) RETURNING *",
      [id_pengguna, keyword],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE satu riwayat
const deleteSearchHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM search_history WHERE id_history = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Riwayat tidak ditemukan" });
    }
    res.json({ message: "Riwayat dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE semua riwayat by pengguna
const clearSearchHistory = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    await pool.query("DELETE FROM search_history WHERE id_pengguna = $1", [
      id_pengguna,
    ]);
    res.json({ message: "Semua riwayat pencarian dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getSearchHistory,
  saveSearchHistory,
  deleteSearchHistory,
  clearSearchHistory,
};
