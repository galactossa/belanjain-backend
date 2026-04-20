const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");

// GET riwayat pencarian by pengguna
const getSearchHistory = async (req, res) => {
  const { id_pengguna } = req.params;
  const { limit = 10 } = req.query;

  try {
    const result = await pool.query(
      "SELECT * FROM search_history WHERE id_pengguna = $1 ORDER BY created_at DESC LIMIT $2",
      [id_pengguna, parseInt(limit)],
    );
    return success(res, result.rows, "Search history retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST simpan keyword pencarian
const saveSearchHistory = async (req, res) => {
  const { id_pengguna, keyword } = req.body;

  if (!id_pengguna || !keyword) {
    return badRequest(res, "id_pengguna dan keyword wajib diisi");
  }

  try {
    const result = await pool.query(
      "INSERT INTO search_history (id_pengguna, keyword) VALUES ($1, $2) RETURNING *",
      [id_pengguna, keyword],
    );
    return created(res, result.rows[0], "Search keyword saved");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
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
      return notFound(res, "Riwayat tidak ditemukan");
    }
    return success(res, null, "Search history deleted");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE semua riwayat by pengguna
const clearSearchHistory = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    await pool.query("DELETE FROM search_history WHERE id_pengguna = $1", [
      id_pengguna,
    ]);
    return success(res, null, "All search history cleared");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getSearchHistory,
  saveSearchHistory,
  deleteSearchHistory,
  clearSearchHistory,
};
