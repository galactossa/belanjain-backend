const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");

// GET keranjang by pengguna
const getKeranjangByPengguna = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT k.*, p.nama_produk, p.harga as harga_produk, p.url_gambar, p.stok as stok_produk, t.nama_toko
            FROM keranjang k
            JOIN produk p ON k.id_produk = p.id_produk
            JOIN toko t ON p.id_toko = t.id_toko
            WHERE k.id_pengguna = $1
            ORDER BY k.created_at DESC
        `,
      [id_pengguna],
    );

    const items = result.rows;
    const total = items.reduce(
      (sum, item) => sum + item.jumlah * item.harga_produk,
      0,
    );

    return success(
      res,
      {
        items,
        total_items: items.length,
        total_harga: total,
      },
      "Cart retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST tambah ke keranjang
const addToKeranjang = async (req, res) => {
  const { id_pengguna, id_produk, jumlah } = req.body;

  if (!id_pengguna || !id_produk) {
    return badRequest(res, "id_pengguna dan id_produk wajib diisi");
  }

  const qty = jumlah || 1;

  try {
    const cekStok = await pool.query(
      "SELECT stok, harga FROM produk WHERE id_produk = $1",
      [id_produk],
    );
    if (cekStok.rows.length === 0) {
      return notFound(res, "Produk tidak ditemukan");
    }

    if (cekStok.rows[0].stok < qty) {
      return badRequest(res, "Stok produk tidak mencukupi");
    }

    const cek = await pool.query(
      "SELECT * FROM keranjang WHERE id_pengguna = $1 AND id_produk = $2",
      [id_pengguna, id_produk],
    );

    if (cek.rows.length > 0) {
      const newJumlah = cek.rows[0].jumlah + qty;
      if (cekStok.rows[0].stok < newJumlah) {
        return badRequest(res, "Stok produk tidak mencukupi");
      }
      const result = await pool.query(
        "UPDATE keranjang SET jumlah = $1, updated_at = CURRENT_TIMESTAMP WHERE id_keranjang = $2 RETURNING *",
        [newJumlah, cek.rows[0].id_keranjang],
      );
      return success(res, result.rows[0], "Jumlah produk diupdate");
    } else {
      const result = await pool.query(
        "INSERT INTO keranjang (id_pengguna, id_produk, jumlah) VALUES ($1, $2, $3) RETURNING *",
        [id_pengguna, id_produk, qty],
      );
      return created(res, result.rows[0], "Produk ditambahkan ke keranjang");
    }
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT update jumlah di keranjang
const updateKeranjang = async (req, res) => {
  const { id } = req.params;
  const { jumlah } = req.body;

  if (!jumlah || jumlah < 1) {
    return badRequest(res, "Jumlah minimal 1");
  }

  try {
    const keranjangItem = await pool.query(
      "SELECT id_produk FROM keranjang WHERE id_keranjang = $1",
      [id],
    );
    if (keranjangItem.rows.length === 0) {
      return notFound(res, "Item keranjang tidak ditemukan");
    }

    const cekStok = await pool.query(
      "SELECT stok FROM produk WHERE id_produk = $1",
      [keranjangItem.rows[0].id_produk],
    );
    if (cekStok.rows[0].stok < jumlah) {
      return badRequest(res, "Stok produk tidak mencukupi");
    }

    const result = await pool.query(
      "UPDATE keranjang SET jumlah = $1, updated_at = CURRENT_TIMESTAMP WHERE id_keranjang = $2 RETURNING *",
      [jumlah, id],
    );
    return success(res, result.rows[0], "Jumlah berhasil diupdate");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE dari keranjang
const deleteFromKeranjang = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM keranjang WHERE id_keranjang = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return notFound(res, "Item keranjang tidak ditemukan");
    }
    return success(res, null, "Item dihapus dari keranjang");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE all keranjang by pengguna
const clearKeranjang = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    await pool.query("DELETE FROM keranjang WHERE id_pengguna = $1", [
      id_pengguna,
    ]);
    return success(res, null, "Keranjang berhasil dikosongkan");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getKeranjangByPengguna,
  addToKeranjang,
  updateKeranjang,
  deleteFromKeranjang,
  clearKeranjang,
};
