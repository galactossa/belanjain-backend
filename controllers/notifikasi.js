const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
  forbidden,
} = require("../middleware/responseFormatter");

// GET notifikasi by pengguna
const getNotifikasiByPengguna = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT * FROM notifikasi 
            WHERE id_pengguna = $1 
            ORDER BY created_at DESC
        `,
      [id_pengguna],
    );
    return success(res, result.rows, "Notifications retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET notifikasi belum dibaca
const getNotifikasiBelumDibaca = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT * FROM notifikasi 
            WHERE id_pengguna = $1 AND sudah_dibaca = false 
            ORDER BY created_at DESC
        `,
      [id_pengguna],
    );
    return success(
      res,
      result.rows,
      "Unread notifications retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT tandai sudah dibaca
const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE notifikasi SET sudah_dibaca = true, updated_at = CURRENT_TIMESTAMP WHERE id_notifikasi = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Notifikasi tidak ditemukan");
    }
    return success(res, result.rows[0], "Notification marked as read");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT tandai semua sudah dibaca
const markAllAsRead = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    await pool.query(
      "UPDATE notifikasi SET sudah_dibaca = true, updated_at = CURRENT_TIMESTAMP WHERE id_pengguna = $1 AND sudah_dibaca = false",
      [id_pengguna],
    );
    return success(res, null, "All notifications marked as read");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST broadcast notifikasi (admin only)
const broadcastNotifikasi = async (req, res) => {
  const { judul, pesan, tipe, role } = req.body;
  const { admin_role } = req.query;

  if (admin_role !== "admin") {
    return forbidden(res, "Hanya admin yang bisa broadcast");
  }

  if (!judul || !pesan) {
    return badRequest(res, "Judul dan pesan wajib diisi");
  }

  try {
    let query = "SELECT id_pengguna FROM pengguna WHERE aktif = true";
    const params = [];

    if (role && role !== "semua") {
      query += " AND role = $1";
      params.push(role);
    }

    const users = await pool.query(query, params);

    for (const user of users.rows) {
      await pool.query(
        "INSERT INTO notifikasi (id_pengguna, judul, pesan, tipe) VALUES ($1, $2, $3, $4)",
        [user.id_pengguna, judul, pesan, tipe || "promo"],
      );
    }

    return created(
      res,
      { total_recipients: users.rows.length },
      `Broadcast dikirim ke ${users.rows.length} pengguna`,
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getNotifikasiByPengguna,
  getNotifikasiBelumDibaca,
  markAsRead,
  markAllAsRead,
  broadcastNotifikasi,
};
