const pool = require("../db/db");
const {
  success,
  error,
  badRequest,
} = require("../middleware/responseFormatter");

// POST follow toko
const followToko = async (req, res) => {
  const { id_pengguna, id_toko } = req.body;

  if (!id_pengguna || !id_toko) {
    return badRequest(res, "id_pengguna dan id_toko wajib diisi");
  }

  try {
    // Cek apakah sudah follow
    const cek = await pool.query(
      "SELECT * FROM follow_toko WHERE id_pengguna = $1 AND id_toko = $2",
      [id_pengguna, id_toko],
    );

    if (cek.rows.length > 0) {
      return badRequest(res, "Sudah mengikuti toko ini");
    }

    await pool.query(
      "INSERT INTO follow_toko (id_pengguna, id_toko) VALUES ($1, $2)",
      [id_pengguna, id_toko],
    );

    return success(res, null, "Berhasil mengikuti toko");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE unfollow toko
const unfollowToko = async (req, res) => {
  const { id_pengguna, id_toko } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM follow_toko WHERE id_pengguna = $1 AND id_toko = $2 RETURNING *",
      [id_pengguna, id_toko],
    );

    if (result.rows.length === 0) {
      return badRequest(res, "Tidak sedang mengikuti toko ini");
    }

    return success(res, null, "Berhenti mengikuti toko");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET daftar toko yang diikuti
const getFollowing = async (req, res) => {
  const { id_pengguna } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
          t.id_toko,
          t.nama_toko,
          t.logo_toko,
          t.deskripsi,
          t.aktif,
          ft.created_at as followed_at
       FROM follow_toko ft
       JOIN toko t ON ft.id_toko = t.id_toko
       WHERE ft.id_pengguna = $1
       ORDER BY ft.created_at DESC`,
      [id_pengguna],
    );

    return success(res, result.rows, "Following list retrieved");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET cek apakah user follow toko tertentu
const cekFollow = async (req, res) => {
  const { id_pengguna, id_toko } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM follow_toko WHERE id_pengguna = $1 AND id_toko = $2",
      [id_pengguna, id_toko],
    );

    return success(
      res,
      { is_following: result.rows.length > 0 },
      "Follow status checked",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  followToko,
  unfollowToko,
  getFollowing,
  cekFollow,
};
