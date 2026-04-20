const pool = require("../db/db");

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

// GET artikel by ID
const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM blogs WHERE id_blog = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Artikel tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST tambah artikel
const createBlog = async (req, res) => {
  const { judul, konten, foto_url, penulis } = req.body;

  if (!judul || !konten) {
    return res.status(400).json({ message: "Judul dan konten wajib diisi" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO blogs (judul, konten, foto_url, penulis) VALUES ($1, $2, $3, $4) RETURNING *",
      [judul, konten, foto_url || null, penulis || "Admin"],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Artikel tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res.status(404).json({ message: "Artikel tidak ditemukan" });
    }
    res.json({ message: "Artikel berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
