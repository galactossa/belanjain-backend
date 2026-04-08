const pool = require("../db/db");

// GET semua pengguna dengan PAGINATION
const getAllPengguna = async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let query =
      "SELECT id_pengguna, nama, email, role, telepon, url_foto, aktif, created_at FROM pengguna";
    let countQuery = "SELECT COUNT(*) FROM pengguna";
    const params = [];
    let paramIndex = 1;

    if (role) {
      query += ` WHERE role = $${paramIndex}`;
      countQuery += ` WHERE role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    query += ` ORDER BY id_pengguna LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const totalResult = await pool.query(countQuery, role ? [role] : []);
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    const result = await pool.query(query, params);

    res.json({
      data: result.rows,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_data: totalData,
        total_page: totalPage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET pengguna by ID (tanpa pagination)
const getPenggunaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id_pengguna, nama, email, role, telepon, url_foto, aktif, created_at FROM pengguna WHERE id_pengguna = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST registrasi pengguna
const register = async (req, res) => {
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

    const result = await pool.query(
      "INSERT INTO pengguna (nama, email, password, telepon) VALUES ($1, $2, $3, $4) RETURNING id_pengguna, nama, email, role",
      [nama, email, password, telepon],
    );
    res
      .status(201)
      .json({ message: "Registrasi berhasil", pengguna: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  try {
    const result = await pool.query("SELECT * FROM pengguna WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const pengguna = result.rows[0];
    if (pengguna.password !== password) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    if (!pengguna.aktif) {
      return res.status(403).json({ message: "Akun anda telah dinonaktifkan" });
    }

    res.json({
      message: "Login berhasil",
      pengguna: {
        id_pengguna: pengguna.id_pengguna,
        nama: pengguna.nama,
        email: pengguna.email,
        role: pengguna.role,
        telepon: pengguna.telepon,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT update pengguna
const updatePengguna = async (req, res) => {
  const { id } = req.params;
  const { nama, telepon, url_foto, aktif } = req.body;
  try {
    const result = await pool.query(
      "UPDATE pengguna SET nama = COALESCE($1, nama), telepon = COALESCE($2, telepon), url_foto = COALESCE($3, url_foto), aktif = COALESCE($4, aktif), updated_at = CURRENT_TIMESTAMP WHERE id_pengguna = $5 RETURNING id_pengguna, nama, email, telepon, url_foto, aktif",
      [nama, telepon, url_foto, aktif, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }
    res.json({ message: "Data berhasil diupdate", pengguna: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT update role pengguna (admin only)
const updateRolePengguna = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const { admin_role } = req.query;

  if (admin_role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa mengubah role" });
  }

  if (!role || !["pembeli", "penjual", "admin"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  try {
    const result = await pool.query(
      "UPDATE pengguna SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id_pengguna = $2 RETURNING id_pengguna, nama, email, role",
      [role, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }
    res.json({ message: "Role berhasil diubah", pengguna: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE pengguna (soft delete)
const deletePengguna = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE pengguna SET aktif = false, updated_at = CURRENT_TIMESTAMP WHERE id_pengguna = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }
    res.json({ message: "Pengguna berhasil dinonaktifkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET pengguna by role (tanpa pagination)
const getPenggunaByRole = async (req, res) => {
  const { role } = req.params;
  try {
    const result = await pool.query(
      "SELECT id_pengguna, nama, email, role, telepon, aktif FROM pengguna WHERE role = $1",
      [role],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllPengguna,
  getPenggunaById,
  register,
  login,
  updatePengguna,
  updateRolePengguna,
  deletePengguna,
  getPenggunaByRole,
};
