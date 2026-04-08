const pool = require("../db/db");

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
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
    res.json({ message: "Semua notifikasi ditandai sudah dibaca" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST broadcast notifikasi (admin only)
const broadcastNotifikasi = async (req, res) => {
  const { judul, pesan, tipe, role } = req.body;
  const { admin_role } = req.query;

  if (admin_role !== "admin") {
    return res.status(403).json({ message: "Hanya admin yang bisa broadcast" });
  }

  if (!judul || !pesan) {
    return res.status(400).json({ message: "Judul dan pesan wajib diisi" });
  }

  try {
    // Ambil semua pengguna
    let query = "SELECT id_pengguna FROM pengguna WHERE aktif = true";
    const params = [];

    if (role && role !== "semua") {
      query += " AND role = $1";
      params.push(role);
    }

    const users = await pool.query(query, params);

    // Insert notifikasi untuk setiap user
    for (const user of users.rows) {
      await pool.query(
        "INSERT INTO notifikasi (id_pengguna, judul, pesan, tipe) VALUES ($1, $2, $3, $4)",
        [user.id_pengguna, judul, pesan, tipe || "promo"],
      );
    }

    res.json({ message: `Broadcast dikirim ke ${users.rows.length} pengguna` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getNotifikasiByPengguna,
  getNotifikasiBelumDibaca,
  markAsRead,
  markAllAsRead,
  broadcastNotifikasi,
};
