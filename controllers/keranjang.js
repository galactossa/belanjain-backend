const pool = require("../db/db");

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

    // Hitung total harga
    const items = result.rows;
    const total = items.reduce(
      (sum, item) => sum + item.jumlah * item.harga_produk,
      0,
    );

    res.json({
      items,
      total_items: items.length,
      total_harga: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST tambah ke keranjang
const addToKeranjang = async (req, res) => {
  const { id_pengguna, id_produk, jumlah } = req.body;

  if (!id_pengguna || !id_produk) {
    return res
      .status(400)
      .json({ message: "id_pengguna dan id_produk wajib diisi" });
  }

  const qty = jumlah || 1;

  try {
    // Cek stok produk
    const cekStok = await pool.query(
      "SELECT stok, harga FROM produk WHERE id_produk = $1",
      [id_produk],
    );
    if (cekStok.rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    if (cekStok.rows[0].stok < qty) {
      return res.status(400).json({ message: "Stok produk tidak mencukupi" });
    }

    // Cek apakah sudah ada di keranjang
    const cek = await pool.query(
      "SELECT * FROM keranjang WHERE id_pengguna = $1 AND id_produk = $2",
      [id_pengguna, id_produk],
    );

    if (cek.rows.length > 0) {
      // Update jumlah
      const newJumlah = cek.rows[0].jumlah + qty;
      if (cekStok.rows[0].stok < newJumlah) {
        return res.status(400).json({ message: "Stok produk tidak mencukupi" });
      }
      const result = await pool.query(
        "UPDATE keranjang SET jumlah = $1, updated_at = CURRENT_TIMESTAMP WHERE id_keranjang = $2 RETURNING *",
        [newJumlah, cek.rows[0].id_keranjang],
      );
      res.json({
        message: "Jumlah produk diupdate",
        keranjang: result.rows[0],
      });
    } else {
      // Tambah baru
      const result = await pool.query(
        "INSERT INTO keranjang (id_pengguna, id_produk, jumlah) VALUES ($1, $2, $3) RETURNING *",
        [id_pengguna, id_produk, qty],
      );
      res
        .status(201)
        .json({
          message: "Produk ditambahkan ke keranjang",
          keranjang: result.rows[0],
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT update jumlah di keranjang
const updateKeranjang = async (req, res) => {
  const { id } = req.params;
  const { jumlah } = req.body;

  if (!jumlah || jumlah < 1) {
    return res.status(400).json({ message: "Jumlah minimal 1" });
  }

  try {
    // Cek stok
    const keranjangItem = await pool.query(
      "SELECT id_produk FROM keranjang WHERE id_keranjang = $1",
      [id],
    );
    if (keranjangItem.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Item keranjang tidak ditemukan" });
    }

    const cekStok = await pool.query(
      "SELECT stok FROM produk WHERE id_produk = $1",
      [keranjangItem.rows[0].id_produk],
    );
    if (cekStok.rows[0].stok < jumlah) {
      return res.status(400).json({ message: "Stok produk tidak mencukupi" });
    }

    const result = await pool.query(
      "UPDATE keranjang SET jumlah = $1, updated_at = CURRENT_TIMESTAMP WHERE id_keranjang = $2 RETURNING *",
      [jumlah, id],
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      return res
        .status(404)
        .json({ message: "Item keranjang tidak ditemukan" });
    }
    res.json({ message: "Item dihapus dari keranjang" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE all keranjang by pengguna
const clearKeranjang = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    await pool.query("DELETE FROM keranjang WHERE id_pengguna = $1", [
      id_pengguna,
    ]);
    res.json({ message: "Keranjang berhasil dikosongkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getKeranjangByPengguna,
  addToKeranjang,
  updateKeranjang,
  deleteFromKeranjang,
  clearKeranjang,
};
