const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
} = require("../middleware/responseFormatter");

// GET semua produk dengan PAGINATION
const getAllProduk = async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM produk WHERE aktif = true",
    );
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    const result = await pool.query(
      `
            SELECT p.*, t.nama_toko, k.nama_kategori 
            FROM produk p 
            JOIN toko t ON p.id_toko = t.id_toko 
            LEFT JOIN kategori k ON p.id_kategori = k.id_kategori 
            WHERE p.aktif = true 
            ORDER BY p.id_produk 
            LIMIT $1 OFFSET $2
        `,
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
          has_next: parseInt(page) < totalPage,
          has_prev: parseInt(page) > 1,
        },
      },
      "Products retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET produk by ID
const getProdukById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT p.*, t.nama_toko, k.nama_kategori 
            FROM produk p 
            JOIN toko t ON p.id_toko = t.id_toko 
            LEFT JOIN kategori k ON p.id_kategori = k.id_kategori 
            WHERE p.id_produk = $1
        `,
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Produk tidak ditemukan");
    }
    return success(res, result.rows[0], "Product retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET produk by toko
const getProdukByToko = async (req, res) => {
  const { id_toko } = req.params;
  const { page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM produk WHERE id_toko = $1 AND aktif = true",
      [id_toko],
    );
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    const result = await pool.query(
      `
            SELECT * FROM produk WHERE id_toko = $1 AND aktif = true 
            LIMIT $2 OFFSET $3
        `,
      [id_toko, parseInt(limit), offset],
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
      "Products retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET produk by kategori
const getProdukByKategori = async (req, res) => {
  const { id_kategori } = req.params;
  const { page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM produk WHERE id_kategori = $1 AND aktif = true",
      [id_kategori],
    );
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    const result = await pool.query(
      `
            SELECT p.*, t.nama_toko 
            FROM produk p 
            JOIN toko t ON p.id_toko = t.id_toko 
            WHERE p.id_kategori = $1 AND p.aktif = true
            LIMIT $2 OFFSET $3
        `,
      [id_kategori, parseInt(limit), offset],
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
      "Products retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST tambah produk
const createProduk = async (req, res) => {
  const {
    id_toko,
    id_kategori,
    nama_produk,
    deskripsi,
    harga,
    stok,
    url_gambar,
  } = req.body;

  if (!id_toko || !nama_produk || !harga) {
    return badRequest(res, "id_toko, nama_produk, dan harga wajib diisi");
  }

  try {
    const result = await pool.query(
      "INSERT INTO produk (id_toko, id_kategori, nama_produk, deskripsi, harga, stok, url_gambar) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        id_toko,
        id_kategori,
        nama_produk,
        deskripsi,
        harga,
        stok || 0,
        url_gambar,
      ],
    );
    return created(res, result.rows[0], "Produk berhasil ditambahkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT update produk
const updateProduk = async (req, res) => {
  const { id } = req.params;
  const {
    nama_produk,
    deskripsi,
    harga,
    stok,
    url_gambar,
    id_kategori,
    aktif,
  } = req.body;
  try {
    const result = await pool.query(
      "UPDATE produk SET nama_produk = COALESCE($1, nama_produk), deskripsi = COALESCE($2, deskripsi), harga = COALESCE($3, harga), stok = COALESCE($4, stok), url_gambar = COALESCE($5, url_gambar), id_kategori = COALESCE($6, id_kategori), aktif = COALESCE($7, aktif), updated_at = CURRENT_TIMESTAMP WHERE id_produk = $8 RETURNING *",
      [nama_produk, deskripsi, harga, stok, url_gambar, id_kategori, aktif, id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Produk tidak ditemukan");
    }
    return success(res, result.rows[0], "Produk berhasil diupdate");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE produk (soft delete)
const deleteProduk = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE produk SET aktif = false, updated_at = CURRENT_TIMESTAMP WHERE id_produk = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Produk tidak ditemukan");
    }
    return success(res, null, "Produk berhasil dinonaktifkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET search produk
const searchProduk = async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;
  if (!q) {
    return badRequest(res, "Parameter q wajib diisi");
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const totalResult = await pool.query(
      `
            SELECT COUNT(*) FROM produk p 
            JOIN toko t ON p.id_toko = t.id_toko 
            WHERE p.nama_produk ILIKE $1 AND p.aktif = true
        `,
      [`%${q}%`],
    );
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    const result = await pool.query(
      `
            SELECT p.*, t.nama_toko 
            FROM produk p 
            JOIN toko t ON p.id_toko = t.id_toko 
            WHERE p.nama_produk ILIKE $1 AND p.aktif = true
            LIMIT $2 OFFSET $3
        `,
      [`%${q}%`, parseInt(limit), offset],
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
          search_keyword: q,
        },
      },
      "Search results retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET filter produk
const filterProduk = async (req, res) => {
  const {
    min_harga,
    max_harga,
    id_kategori,
    sort,
    page = 1,
    limit = 12,
  } = req.query;
  let query = `
        SELECT p.*, t.nama_toko 
        FROM produk p 
        JOIN toko t ON p.id_toko = t.id_toko 
        WHERE p.aktif = true
    `;
  const params = [];
  let paramIndex = 1;

  if (min_harga) {
    query += ` AND p.harga >= $${paramIndex++}`;
    params.push(min_harga);
  }
  if (max_harga) {
    query += ` AND p.harga <= $${paramIndex++}`;
    params.push(max_harga);
  }
  if (id_kategori) {
    query += ` AND p.id_kategori = $${paramIndex++}`;
    params.push(id_kategori);
  }

  if (sort === "harga_terendah") {
    query += " ORDER BY p.harga ASC";
  } else if (sort === "harga_tertinggi") {
    query += " ORDER BY p.harga DESC";
  } else if (sort === "terlaris") {
    query += " ORDER BY p.total_terjual DESC";
  } else if (sort === "rating_tertinggi") {
    query += " ORDER BY p.rata_rating DESC";
  } else {
    query += " ORDER BY p.id_produk DESC";
  }

  const countQuery = query.replace(/SELECT p\..* FROM/, "SELECT COUNT(*) FROM");
  const totalResult = await pool.query(countQuery, params);
  const totalData = parseInt(totalResult.rows[0].count);
  const totalPage = Math.ceil(totalData / parseInt(limit));

  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(parseInt(limit), offset);

  try {
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
          filters: { min_harga, max_harga, id_kategori, sort },
        },
      },
      "Filtered products retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET search suggestions
const getSearchSuggestions = async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return success(res, [], "No suggestions (keyword too short)");
  }

  try {
    const result = await pool.query(
      `SELECT id_produk, nama_produk, harga, url_gambar 
             FROM produk 
             WHERE nama_produk ILIKE $1 AND aktif = true 
             ORDER BY total_terjual DESC 
             LIMIT 5`,
      [`%${q}%`],
    );
    return success(res, result.rows, "Suggestions retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getAllProduk,
  getProdukById,
  getProdukByToko,
  getProdukByKategori,
  createProduk,
  updateProduk,
  deleteProduk,
  searchProduk,
  filterProduk,
  getSearchSuggestions,
};
