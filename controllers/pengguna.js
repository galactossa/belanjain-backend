const pool = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
} = require("../middleware/responseFormatter");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_default_ganti_nanti";

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

    return success(
      res,
      {
        data: result.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total_data: totalData,
          total_page: totalPage,
        },
      },
      "Users retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET pengguna by ID
const getPenggunaById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id_pengguna, nama, email, role, telepon, url_foto, aktif, created_at FROM pengguna WHERE id_pengguna = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Pengguna tidak ditemukan");
    }
    return success(res, result.rows[0], "User retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST registrasi pengguna
const register = async (req, res) => {
  const { nama, email, password, telepon } = req.body;

  if (!nama || !email || !password) {
    return badRequest(res, "Nama, email, dan password wajib diisi");
  }

  try {
    const cekEmail = await pool.query(
      "SELECT * FROM pengguna WHERE email = $1",
      [email],
    );
    if (cekEmail.rows.length > 0) {
      return badRequest(res, "Email sudah terdaftar");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO pengguna (nama, email, password, telepon) VALUES ($1, $2, $3, $4) RETURNING id_pengguna, nama, email, role",
      [nama, email, hashedPassword, telepon],
    );

    return created(res, result.rows[0], "Registrasi berhasil");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return badRequest(res, "Email dan password wajib diisi");
  }

  try {
    const result = await pool.query("SELECT * FROM pengguna WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return unauthorized(res, "Email atau password salah");
    }

    const pengguna = result.rows[0];

    const validPassword = await bcrypt.compare(password, pengguna.password);
    if (!validPassword) {
      return unauthorized(res, "Email atau password salah");
    }

    if (!pengguna.aktif) {
      return forbidden(res, "Akun anda telah dinonaktifkan");
    }

    const token = jwt.sign(
      { id: pengguna.id_pengguna, email: pengguna.email, role: pengguna.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return success(
      res,
      {
        token: token,
        pengguna: {
          id_pengguna: pengguna.id_pengguna,
          nama: pengguna.nama,
          email: pengguna.email,
          role: pengguna.role,
          telepon: pengguna.telepon,
        },
      },
      "Login berhasil",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
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
      return notFound(res, "Pengguna tidak ditemukan");
    }
    return success(res, result.rows[0], "Data berhasil diupdate");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT update role pengguna (admin only)
const updateRolePengguna = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !["pembeli", "penjual", "admin"].includes(role)) {
    return badRequest(res, "Role tidak valid");
  }

  try {
    const result = await pool.query(
      "UPDATE pengguna SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id_pengguna = $2 RETURNING id_pengguna, nama, email, role",
      [role, id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Pengguna tidak ditemukan");
    }
    return success(res, result.rows[0], "Role berhasil diubah");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
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
      return notFound(res, "Pengguna tidak ditemukan");
    }
    return success(res, null, "Pengguna berhasil dinonaktifkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET pengguna by role
const getPenggunaByRole = async (req, res) => {
  const { role } = req.params;
  try {
    const result = await pool.query(
      "SELECT id_pengguna, nama, email, role, telepon, aktif FROM pengguna WHERE role = $1",
      [role],
    );
    return success(res, result.rows, "Users retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
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
