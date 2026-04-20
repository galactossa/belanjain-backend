const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");

// GET semua artikel (dengan pagination)
const getAllBlogs = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const totalResult = await pool.query("SELECT COUNT(*) FROM blogs");
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    const result = await pool.query(
      "SELECT * FROM blogs ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [parseInt(limit), offset],
    );

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
      "Blogs retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET artikel by ID
const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM blogs WHERE id_blog = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return notFound(res, "Artikel tidak ditemukan");
    }
    return success(res, result.rows[0], "Blog retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST tambah artikel
const createBlog = async (req, res) => {
  const { judul, konten, foto_url, penulis } = req.body;

  if (!judul || !konten) {
    return badRequest(res, "Judul dan konten wajib diisi");
  }

  try {
    const result = await pool.query(
      "INSERT INTO blogs (judul, konten, foto_url, penulis) VALUES ($1, $2, $3, $4) RETURNING *",
      [judul, konten, foto_url || null, penulis || "Admin"],
    );

    return created(res, result.rows[0], "Artikel berhasil ditambahkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT update artikel
const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { judul, konten, foto_url } = req.body;

  try {
    const result = await pool.query(
      "UPDATE blogs SET judul = COALESCE($1, judul), konten = COALESCE($2, konten), foto_url = COALESCE($3, foto_url), updated_at = CURRENT_TIMESTAMP WHERE id_blog = $4 RETURNING *",
      [judul, konten, foto_url, id],
    );

    if (result.rows.length === 0) {
      return notFound(res, "Artikel tidak ditemukan");
    }

    return success(res, result.rows[0], "Artikel berhasil diupdate");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE artikel
const deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM blogs WHERE id_blog = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Artikel tidak ditemukan");
    }
    return success(res, null, "Artikel berhasil dihapus");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
