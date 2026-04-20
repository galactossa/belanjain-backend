const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");

// GET wishlist by pengguna
const getWishlistByPengguna = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT w.*, p.nama_produk, p.harga, p.url_gambar, t.nama_toko
            FROM wishlist w
            JOIN produk p ON w.id_produk = p.id_produk
            JOIN toko t ON p.id_toko = t.id_toko
            WHERE w.id_pengguna = $1
            ORDER BY w.created_at DESC
        `,
      [id_pengguna],
    );
    return success(res, result.rows, "Wishlist retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST tambah ke wishlist
const addToWishlist = async (req, res) => {
  const { id_pengguna, id_produk } = req.body;

  if (!id_pengguna || !id_produk) {
    return badRequest(res, "id_pengguna dan id_produk wajib diisi");
  }

  try {
    const cek = await pool.query(
      "SELECT * FROM wishlist WHERE id_pengguna = $1 AND id_produk = $2",
      [id_pengguna, id_produk],
    );
    if (cek.rows.length > 0) {
      return badRequest(res, "Produk sudah ada di wishlist");
    }

    const result = await pool.query(
      "INSERT INTO wishlist (id_pengguna, id_produk) VALUES ($1, $2) RETURNING *",
      [id_pengguna, id_produk],
    );
    return created(res, result.rows[0], "Produk ditambahkan ke wishlist");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE dari wishlist
const removeFromWishlist = async (req, res) => {
  const { id_pengguna, id_produk } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM wishlist WHERE id_pengguna = $1 AND id_produk = $2 RETURNING *",
      [id_pengguna, id_produk],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Produk tidak ditemukan di wishlist");
    }
    return success(res, null, "Produk dihapus dari wishlist");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET cek produk di wishlist
const cekWishlist = async (req, res) => {
  const { id_pengguna, id_produk } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM wishlist WHERE id_pengguna = $1 AND id_produk = $2",
      [id_pengguna, id_produk],
    );
    return success(
      res,
      { ada: result.rows.length > 0 },
      "Wishlist check completed",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getWishlistByPengguna,
  addToWishlist,
  removeFromWishlist,
  cekWishlist,
};
