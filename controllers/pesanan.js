const pool = require("../db/db");

// GET semua pesanan by pengguna
const getPesananByPengguna = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT p.*, a.nama_penerima, a.kota, v.kode as kode_voucher
            FROM pesanan p
            JOIN alamat a ON p.id_alamat = a.id_alamat
            LEFT JOIN voucher v ON p.id_voucher = v.id_voucher
            WHERE p.id_pengguna = $1
            ORDER BY p.created_at DESC
        `,
      [id_pengguna],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET pesanan by ID
const getPesananById = async (req, res) => {
  const { id } = req.params;
  try {
    // Ambil data pesanan
    const pesananResult = await pool.query(
      `
            SELECT p.*, a.nama_penerima, a.telepon, a.alamat, a.kota, a.kode_pos, v.kode as kode_voucher
            FROM pesanan p
            JOIN alamat a ON p.id_alamat = a.id_alamat
            LEFT JOIN voucher v ON p.id_voucher = v.id_voucher
            WHERE p.id_pesanan = $1
        `,
      [id],
    );

    if (pesananResult.rows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    // Ambil item pesanan
    const itemsResult = await pool.query(
      `
            SELECT ip.*, pr.nama_produk, pr.url_gambar
            FROM item_pesanan ip
            JOIN produk pr ON ip.id_produk = pr.id_produk
            WHERE ip.id_pesanan = $1
        `,
      [id],
    );

    res.json({
      ...pesananResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST buat pesanan (checkout)
const createPesanan = async (req, res) => {
  const { id_pengguna, id_alamat, id_voucher, metode_pembayaran } = req.body;

  if (!id_pengguna || !id_alamat) {
    return res
      .status(400)
      .json({ message: "id_pengguna dan id_alamat wajib diisi" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Ambil keranjang pengguna
    const keranjangResult = await client.query(
      `
            SELECT k.*, p.harga, p.stok, p.id_toko
            FROM keranjang k
            JOIN produk p ON k.id_produk = p.id_produk
            WHERE k.id_pengguna = $1
        `,
      [id_pengguna],
    );

    if (keranjangResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Keranjang kosong" });
    }

    // Hitung total harga
    let total_harga = 0;
    for (const item of keranjangResult.rows) {
      total_harga += item.jumlah * item.harga;
    }

    // Hitung diskon jika ada voucher
    let potongan_diskon = 0;
    let voucherData = null;

    if (id_voucher) {
      const voucherResult = await client.query(
        `
                SELECT * FROM voucher 
                WHERE id_voucher = $1 
                AND aktif = true 
                AND berlaku_dari <= CURRENT_DATE 
                AND berlaku_sampai >= CURRENT_DATE
            `,
        [id_voucher],
      );

      if (voucherResult.rows.length > 0) {
        voucherData = voucherResult.rows[0];

        if (total_harga >= voucherData.minimal_belanja) {
          if (voucherData.tipe_diskon === "persen") {
            potongan_diskon = (total_harga * voucherData.nilai_diskon) / 100;
            if (
              voucherData.maksimal_diskon &&
              potongan_diskon > voucherData.maksimal_diskon
            ) {
              potongan_diskon = voucherData.maksimal_diskon;
            }
          } else {
            potongan_diskon = voucherData.nilai_diskon;
          }
        }
      }
    }

    const harga_akhir = total_harga - potongan_diskon;

    // Buat pesanan
    const pesananResult = await client.query(
      "INSERT INTO pesanan (id_pengguna, id_alamat, id_voucher, total_harga, potongan_diskon, harga_akhir, metode_pembayaran, status_pembayaran) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        id_pengguna,
        id_alamat,
        id_voucher,
        total_harga,
        potongan_diskon,
        harga_akhir,
        metode_pembayaran || "transfer",
        "menunggu",
      ],
    );

    const pesanan = pesananResult.rows[0];

    // Buat item pesanan dan kurangi stok
    for (const item of keranjangResult.rows) {
      await client.query(
        "INSERT INTO item_pesanan (id_pesanan, id_produk, jumlah, harga, subtotal) VALUES ($1, $2, $3, $4, $5)",
        [
          pesanan.id_pesanan,
          item.id_produk,
          item.jumlah,
          item.harga,
          item.jumlah * item.harga,
        ],
      );

      // Kurangi stok
      await client.query(
        "UPDATE produk SET stok = stok - $1, total_terjual = total_terjual + $1 WHERE id_produk = $2",
        [item.jumlah, item.id_produk],
      );
    }

    // Kosongkan keranjang
    await client.query("DELETE FROM keranjang WHERE id_pengguna = $1", [
      id_pengguna,
    ]);

    // Buat notifikasi
    await client.query(
      "INSERT INTO notifikasi (id_pengguna, judul, pesan, tipe) VALUES ($1, $2, $3, $4)",
      [
        id_pengguna,
        "Pesanan Dibuat",
        `Pesanan #${pesanan.id_pesanan} berhasil dibuat. Total: Rp${harga_akhir.toLocaleString()}`,
        "pesanan",
      ],
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Pesanan berhasil dibuat",
      pesanan: {
        id_pesanan: pesanan.id_pesanan,
        total_harga,
        potongan_diskon,
        harga_akhir,
        status: pesanan.status,
        status_pembayaran: pesanan.status_pembayaran,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// PUT update status pesanan (seller/admin)
const updateStatusPesanan = async (req, res) => {
  const { id } = req.params;
  const { status, nomor_resi } = req.body;

  try {
    const result = await pool.query(
      "UPDATE pesanan SET status = $1, nomor_resi = COALESCE($2, nomor_resi), updated_at = CURRENT_TIMESTAMP WHERE id_pesanan = $3 RETURNING *",
      [status, nomor_resi, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    // Buat notifikasi untuk pembeli
    await pool.query(
      "INSERT INTO notifikasi (id_pengguna, judul, pesan, tipe) VALUES ($1, $2, $3, $4)",
      [
        result.rows[0].id_pengguna,
        "Update Status Pesanan",
        `Pesanan #${id} status: ${status}`,
        "pesanan",
      ],
    );

    res.json({ message: "Status pesanan diupdate", pesanan: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT update pembayaran
const updatePembayaran = async (req, res) => {
  const { id } = req.params;
  const { status_pembayaran, metode_pembayaran } = req.body;

  try {
    const result = await pool.query(
      "UPDATE pesanan SET status_pembayaran = $1, metode_pembayaran = COALESCE($2, metode_pembayaran), updated_at = CURRENT_TIMESTAMP WHERE id_pesanan = $3 RETURNING *",
      [status_pembayaran, metode_pembayaran, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    // Buat transaksi jika pembayaran sukses
    if (status_pembayaran === "sukses") {
      await pool.query(
        "INSERT INTO transaksi (id_pesanan, metode_pembayaran, jumlah_dibayar, status_pembayaran, waktu_pembayaran) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)",
        [
          id,
          metode_pembayaran || result.rows[0].metode_pembayaran,
          result.rows[0].harga_akhir,
          "sukses",
        ],
      );

      // Notifikasi pembayaran sukses
      await pool.query(
        "INSERT INTO notifikasi (id_pengguna, judul, pesan, tipe) VALUES ($1, $2, $3, $4)",
        [
          result.rows[0].id_pengguna,
          "Pembayaran Sukses",
          `Pembayaran untuk pesanan #${id} telah diterima`,
          "pesanan",
        ],
      );
    }

    res.json({
      message: "Status pembayaran diupdate",
      pesanan: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET pesanan by toko (untuk seller)
const getPesananByToko = async (req, res) => {
  const { id_toko } = req.params;
  try {
    const result = await pool.query(
      `
            SELECT DISTINCT p.*, a.nama_penerima, a.kota
            FROM pesanan p
            JOIN alamat a ON p.id_alamat = a.id_alamat
            JOIN item_pesanan ip ON p.id_pesanan = ip.id_pesanan
            JOIN produk pr ON ip.id_produk = pr.id_produk
            WHERE pr.id_toko = $1
            ORDER BY p.created_at DESC
        `,
      [id_toko],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPesananByPengguna,
  getPesananById,
  createPesanan,
  updateStatusPesanan,
  updatePembayaran,
  getPesananByToko,
};
