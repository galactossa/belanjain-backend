const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");
const fs = require("fs");
const path = require("path");

// GET semua produk dengan PAGINATION + FILTER LENGKAP + SHOPPING MODE
const getAllProduk = async (req, res) => {
  const {
    page = 1,
    limit = 12,
    id_kategori,
    q,
    min_harga,
    max_harga,
    brands,
    min_rating,
    shopping_mode,
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let query = `
      SELECT p.*, t.nama_toko, k.nama_kategori 
      FROM produk p 
      JOIN toko t ON p.id_toko = t.id_toko 
      LEFT JOIN kategori k ON p.id_kategori = k.id_kategori 
      WHERE p.aktif = true
    `;
    let countQuery = "SELECT COUNT(*) FROM produk p WHERE p.aktif = true";
    const params = [];
    let paramIndex = 1;

    // Filter kategori
    if (id_kategori) {
      query += ` AND p.id_kategori = $${paramIndex}`;
      countQuery += ` AND p.id_kategori = $${paramIndex}`;
      params.push(id_kategori);
      paramIndex++;
    }

    // Filter search
    if (q) {
      query += ` AND p.nama_produk ILIKE $${paramIndex}`;
      countQuery += ` AND p.nama_produk ILIKE $${paramIndex}`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    // Filter harga
    if (min_harga) {
      query += ` AND p.harga >= $${paramIndex}`;
      countQuery += ` AND p.harga >= $${paramIndex}`;
      params.push(min_harga);
      paramIndex++;
    }
    if (max_harga) {
      query += ` AND p.harga <= $${paramIndex}`;
      countQuery += ` AND p.harga <= $${paramIndex}`;
      params.push(max_harga);
      paramIndex++;
    }

    // Filter brands
    if (brands) {
      const brandArray = brands.split(",");
      const brandConditions = brandArray
        .map((_, i) => `t.nama_toko ILIKE $${paramIndex + i}`)
        .join(" OR ");
      query += ` AND (${brandConditions})`;
      countQuery += ` AND (${brandConditions.replace(/t\.nama_toko/g, "t.nama_toko")})`;
      brandArray.forEach((b) => {
        params.push(`%${b.trim()}%`);
        paramIndex++;
      });
    }

    // Filter rating
    if (min_rating) {
      query += ` AND p.rata_rating >= $${paramIndex}`;
      countQuery += ` AND p.rata_rating >= $${paramIndex}`;
      params.push(min_rating);
      paramIndex++;
    }

    // 🔥 SHOPPING MODE - Sorting berdasarkan mode
    if (shopping_mode) {
      switch (shopping_mode) {
        case "HEMAT":
          // Produk dengan harga termurah
          query += ` ORDER BY p.harga ASC, p.total_terjual DESC`;
          break;
        case "PREMIUM":
          // Produk dengan rating tertinggi, harga premium
          query += ` ORDER BY p.rata_rating DESC, p.harga DESC`;
          break;
        case "FLASH":
          // Produk dengan stok terbatas (untuk flash sale)
          query += ` ORDER BY p.stok ASC, p.total_terjual DESC`;
          break;
        default:
          query += ` ORDER BY p.id_produk`;
      }
    } else {
      query += ` ORDER BY p.id_produk`;
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const countParams = params.slice(0, params.length - 2);
    const totalResult = await pool.query(countQuery, countParams);
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

// GET trend produk (harga naik/turun)
const getTrendProduk = async (req, res) => {
  const { id } = req.params;
  const { days = 7 } = req.query;

  try {
    const produkResult = await pool.query(
      "SELECT id_produk, nama_produk, harga FROM produk WHERE id_produk = $1 AND aktif = true",
      [id],
    );
    if (produkResult.rows.length === 0) {
      return notFound(res, "Produk tidak ditemukan");
    }

    const produk = produkResult.rows[0];
    const hargaSekarang = parseFloat(produk.harga);

    const historyResult = await pool.query(
      `
      SELECT ip.harga, p.created_at
      FROM item_pesanan ip
      JOIN pesanan p ON ip.id_pesanan = p.id_pesanan
      WHERE ip.id_produk = $1 
        AND p.status = 'selesai'
        AND p.created_at >= NOW() - INTERVAL '${days} days'
      ORDER BY p.created_at DESC
      LIMIT 1
      `,
      [id],
    );

    let trend = null;
    let persentase = 0;
    let status = "stabil";
    let arrow = "➡️";

    if (historyResult.rows.length > 0) {
      const hargaLalu = parseFloat(historyResult.rows[0].harga);
      persentase = ((hargaSekarang - hargaLalu) / hargaLalu) * 100;

      if (persentase > 5) {
        status = "naik";
        arrow = "📈";
      } else if (persentase < -5) {
        status = "turun";
        arrow = "📉";
      } else {
        status = "stabil";
        arrow = "➡️";
      }

      trend = {
        status: status,
        arrow: arrow,
        persentase: Math.abs(Math.round(persentase)),
        harga_sekarang: hargaSekarang,
        harga_periode_lalu: hargaLalu,
        periode: `${days} hari yang lalu`,
      };
    } else {
      trend = {
        status: "belum_cukup_data",
        arrow: "❓",
        persentase: 0,
        harga_sekarang: hargaSekarang,
        harga_periode_lalu: null,
        periode: `Tidak ada data penjualan ${days} hari terakhir`,
      };
    }

    return success(res, trend, "Trend produk retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// UPLOAD gambar produk
const uploadGambarProduk = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return badRequest(res, "File gambar wajib diupload");
  }

  try {
    const imageUrl = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      "UPDATE produk SET url_gambar = $1, updated_at = CURRENT_TIMESTAMP WHERE id_produk = $2 RETURNING id_produk, nama_produk, url_gambar",
      [imageUrl, id],
    );

    if (result.rows.length === 0) {
      return notFound(res, "Produk tidak ditemukan");
    }

    return success(res, result.rows[0], "Gambar produk berhasil diupload");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// TAMBAH gambar galeri produk
const addGaleriProduk = async (req, res) => {
  const { id } = req.params;
  const { is_primary } = req.body;

  if (!req.file) {
    return badRequest(res, "File gambar wajib diupload");
  }

  try {
    const produkCheck = await pool.query(
      "SELECT id_produk FROM produk WHERE id_produk = $1",
      [id],
    );
    if (produkCheck.rows.length === 0) {
      return notFound(res, "Produk tidak ditemukan");
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    if (is_primary === "true" || is_primary === true) {
      await pool.query(
        "UPDATE product_images SET is_primary = false WHERE id_produk = $1",
        [id],
      );
    }

    const result = await pool.query(
      "INSERT INTO product_images (id_produk, image_url, is_primary) VALUES ($1, $2, $3) RETURNING *",
      [id, imageUrl, is_primary === "true" || is_primary === true],
    );

    return created(res, result.rows[0], "Gambar galeri berhasil ditambahkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET semua galeri produk
const getGaleriProduk = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM product_images WHERE id_produk = $1 ORDER BY is_primary DESC, created_at ASC",
      [id],
    );

    return success(res, result.rows, "Galeri produk retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE gambar galeri
const deleteGaleriProduk = async (req, res) => {
  const { id_image } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM product_images WHERE id_image = $1 RETURNING *",
      [id_image],
    );

    if (result.rows.length === 0) {
      return notFound(res, "Gambar tidak ditemukan");
    }

    const filePath = "./uploads/" + path.basename(result.rows[0].image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return success(res, null, "Gambar galeri berhasil dihapus");
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
  getTrendProduk,
  uploadGambarProduk,
  addGaleriProduk,
  getGaleriProduk,
  deleteGaleriProduk,
};
