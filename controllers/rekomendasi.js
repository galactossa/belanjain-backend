const pool = require("../db/db");
const { success, error, notFound } = require("../middleware/responseFormatter");

// GET rekomendasi harga optimal untuk produk
const getRekomendasiHarga = async (req, res) => {
  const { id_produk } = req.params;

  try {
    // Cek apakah produk ada
    const produkResult = await pool.query(
      "SELECT id_produk, nama_produk, harga, harga as harga_saat_ini, stok FROM produk WHERE id_produk = $1 AND aktif = true",
      [id_produk],
    );
    if (produkResult.rows.length === 0) {
      return notFound(res, "Produk tidak ditemukan");
    }

    const produk = produkResult.rows[0];
    const hargaSaatIni = parseFloat(produk.harga_saat_ini);

    // Ambil data historis penjualan untuk produk ini
    const historyResult = await pool.query(
      `
      SELECT 
        ip.harga as harga_jual,
        SUM(ip.jumlah) as total_terjual
      FROM item_pesanan ip
      JOIN pesanan p ON ip.id_pesanan = p.id_pesanan
      WHERE ip.id_produk = $1 AND p.status = 'selesai'
      GROUP BY ip.harga
      ORDER BY ip.harga ASC
      `,
      [id_produk],
    );

    if (historyResult.rows.length === 0) {
      // Tidak ada data penjualan, return rekomendasi default
      return success(
        res,
        {
          id_produk: parseInt(id_produk),
          nama_produk: produk.nama_produk,
          harga_saat_ini: hargaSaatIni,
          rekomendasi_harga: hargaSaatIni,
          pertimbangan: "Belum ada data penjualan. Pertahankan harga saat ini.",
          stok: produk.stok,
          strategi:
            "Pantau performa dan coba diskon kecil untuk menguji pasar.",
        },
        "Rekomendasi harga retrieved successfully",
      );
    }

    // Hitung rata-rata tertimbang (weighted average)
    let totalTerjual = 0;
    let totalNilai = 0;

    for (const row of historyResult.rows) {
      totalTerjual += parseInt(row.total_terjual);
      totalNilai += parseFloat(row.harga_jual) * parseInt(row.total_terjual);
    }

    const rataRataTertimbang = totalNilai / totalTerjual;

    // Tentukan rekomendasi harga berdasarkan persentil
    const hargaList = [];
    for (const row of historyResult.rows) {
      for (let i = 0; i < row.total_terjual; i++) {
        hargaList.push(parseFloat(row.harga_jual));
      }
    }
    hargaList.sort((a, b) => a - b);

    // Ambil persentil ke-75 (harga terlaris di kisaran atas)
    const persentil75 = hargaList[Math.floor((hargaList.length - 1) * 0.75)];
    const persentil25 = hargaList[Math.floor((hargaList.length - 1) * 0.25)];

    let rekomendasiHarga = hargaSaatIni;
    let strategi = "";
    let pertimbangan = "";

    if (hargaSaatIni > persentil75) {
      rekomendasiHarga = persentil75;
      strategi = "Harga Terlalu Tinggi";
      pertimbangan = `Harga Anda (Rp${hargaSaatIni.toLocaleString()}) lebih tinggi dari harga rata-rata produk serupa (Rp${persentil75.toLocaleString()}). Menurunkan harga dapat meningkatkan volume penjualan.`;
    } else if (hargaSaatIni < persentil25) {
      rekomendasiHarga = persentil25;
      strategi = "Harga Terlalu Rendah";
      pertimbangan = `Harga Anda (Rp${hargaSaatIni.toLocaleString()}) lebih rendah dari harga rata-rata produk serupa (Rp${persentil25.toLocaleString()}). Anda bisa menaikkan harga untuk meningkatkan profit.`;
    } else {
      rekomendasiHarga = rataRataTertimbang;
      strategi = "Harga Kompetitif";
      pertimbangan = `Harga Anda cukup kompetitif. Pertahankan strategi harga saat ini atau lakukan A/B testing dengan harga Rp${rekomendasiHarga.toLocaleString()} untuk melihat performa.`;
    }

    // Rekomendasi harga optimal dibulatkan ke ribuan terdekat
    const hargaOptimal = Math.round(rekomendasiHarga / 1000) * 1000;

    return success(
      res,
      {
        id_produk: parseInt(id_produk),
        nama_produk: produk.nama_produk,
        harga_saat_ini: hargaSaatIni,
        harga_optimal: hargaOptimal,
        statistik_penjualan: {
          total_terjual: totalTerjual,
          rata_rata_harga: Math.round(rataRataTertimbang),
          harga_terendah: hargaList[0],
          harga_tertinggi: hargaList[hargaList.length - 1],
          persentil_25: persentil25,
          persentil_75: persentil75,
        },
        stok: produk.stok,
        strategi: strategi,
        pertimbangan: pertimbangan,
        rekomendasi: `Rp${hargaOptimal.toLocaleString()}`,
      },
      "Rekomendasi harga retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getRekomendasiHarga,
};
