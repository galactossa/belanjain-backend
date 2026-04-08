const pool = require("../db/db");

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
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST tambah ke wishlist
const addToWishlist = async (req, res) => {
  const { id_pengguna, id_produk } = req.body;

  if (!id_pengguna || !id_produk) {
    return res
      .status(400)
      .json({ message: "id_pengguna dan id_produk wajib diisi" });
  }

  try {
    // Cek apakah sudah ada
    const cek = await pool.query(
      "SELECT * FROM wishlist WHERE id_pengguna = $1 AND id_produk = $2",
      [id_pengguna, id_produk],
    );
    if (cek.rows.length > 0) {
      return res.status(400).json({ message: "Produk sudah ada di wishlist" });
    }

    const result = await pool.query(
      "INSERT INTO wishlist (id_pengguna, id_produk) VALUES ($1, $2) RETURNING *",
      [id_pengguna, id_produk],
    );
    res
      .status(201)
      .json({
        message: "Produk ditambahkan ke wishlist",
        wishlist: result.rows[0],
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res
        .status(404)
        .json({ message: "Produk tidak ditemukan di wishlist" });
    }
    res.json({ message: "Produk dihapus dari wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
    res.json({ ada: result.rows.length > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getWishlistByPengguna,
  addToWishlist,
  removeFromWishlist,
  cekWishlist,
};
