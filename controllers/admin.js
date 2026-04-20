const pool = require("../db/db");
const bcrypt = require("bcrypt");

// GET semua admin
const getAllAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id_pengguna, nama, email, role, telepon, created_at FROM pengguna WHERE role = 'admin'",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST tambah admin baru
const createAdmin = async (req, res) => {
  const { nama, email, password, telepon } = req.body;

  if (!nama || !email || !password) {
    return res
      .status(400)
      .json({ message: "Nama, email, dan password wajib diisi" });
  }

  try {
    const cekEmail = await pool.query(
      "SELECT * FROM pengguna WHERE email = $1",
      [email],
    );
    if (cekEmail.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO pengguna (nama, email, password, role, telepon) VALUES ($1, $2, $3, $4, $5) RETURNING id_pengguna, nama, email, role",
      [nama, email, hashedPassword, "admin", telepon],
    );

    res
      .status(201)
      .json({ message: "Admin berhasil ditambahkan", admin: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT edit admin
const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { nama, telepon } = req.body;

  try {
    const result = await pool.query(
      "UPDATE pengguna SET nama = COALESCE($1, nama), telepon = COALESCE($2, telepon), updated_at = CURRENT_TIMESTAMP WHERE id_pengguna = $3 AND role = $4 RETURNING id_pengguna, nama, email, role",
      [nama, telepon, id, "admin"],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    res.json({ message: "Admin berhasil diupdate", admin: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE hapus admin
const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  // Cek jangan sampai menghapus admin terakhir
  try {
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM pengguna WHERE role = 'admin'",
    );
    const adminCount = parseInt(countResult.rows[0].count);

    if (adminCount <= 1) {
      return res
        .status(400)
        .json({ message: "Tidak bisa menghapus admin terakhir" });
    }

    const result = await pool.query(
      "DELETE FROM pengguna WHERE id_pengguna = $1 AND role = $2 RETURNING *",
      [id, "admin"],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    res.json({ message: "Admin berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllAdmin, createAdmin, updateAdmin, deleteAdmin };
