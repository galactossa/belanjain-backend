const pool = require("../db/db");

// GET trust score untuk satu produk
const getTrustScoreProduk = async (req, res) => {
  const { id_produk } = req.params;

  try {
    // 1. Ambil rating rata-rata (sudah ada di tabel produk)
    const produkResult = await pool.query(
      "SELECT rata_rating, total_terjual FROM produk WHERE id_produk = $1",
      [id_produk],
    );

    if (produkResult.rows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const rating = parseFloat(produkResult.rows[0].rata_rating) || 0;
    const totalTerjual = parseInt(produkResult.rows[0].total_terjual) || 0;

    // 2. Hitung konsistensi review (persentase rating >= 4)
    const konsistensiResult = await pool.query(
      `
            SELECT 
                COUNT(*) as total_review,
                COUNT(CASE WHEN rating >= 4 THEN 1 END) as review_baik
            FROM ulasan
            WHERE id_produk = $1
        `,
      [id_produk],
    );

    const totalReview = parseInt(konsistensiResult.rows[0].total_review) || 0;
    const reviewBaik = parseInt(konsistensiResult.rows[0].review_baik) || 0;
    const konsistensiReview =
      totalReview > 0 ? (reviewBaik / totalReview) * 100 : 0;

    // 3. Hitung kecepatan kirim (rata-rata hari pengiriman)
    const kecepatanResult = await pool.query(
      `
            SELECT AVG(EXTRACT(DAY FROM (p.updated_at - p.created_at))) as rata_hari
            FROM pesanan p
            JOIN item_pesanan ip ON p.id_pesanan = ip.id_pesanan
            WHERE ip.id_produk = $1 AND p.status = 'selesai'
        `,
      [id_produk],
    );

    let kecepatanKirim = 100; // default 100
    const rataHari = parseFloat(kecepatanResult.rows[0].rata_hari);
    if (rataHari && rataHari > 0) {
      // Konversi: semakin cepat kirim, semakin tinggi skor
      kecepatanKirim = Math.max(0, 100 - rataHari * 10);
      kecepatanKirim = Math.min(100, kecepatanKirim);
    }

    // 4. Hitung Trust Score (0-100)
    // Normalisasi setiap komponen ke skala 0-100
    const ratingScore = (rating / 5) * 100;
    const terjualScore = Math.min(100, (totalTerjual / 100) * 100);

    const trustScore =
      ratingScore * 0.4 +
      terjualScore * 0.3 +
      konsistensiReview * 0.2 +
      kecepatanKirim * 0.1;

    // 5. Tentukan level kepercayaan
    let level = "Perlu Dipertimbangkan";
    let badge = "⚠️";
    if (trustScore >= 80) {
      level = "Sangat Terpercaya";
      badge = "🏆";
    } else if (trustScore >= 60) {
      level = "Terpercaya";
      badge = "✅";
    } else if (trustScore >= 40) {
      level = "Cukup Terpercaya";
      badge = "👍";
    }

    res.json({
      id_produk: parseInt(id_produk),
      trust_score: Math.round(trustScore),
      level: level,
      badge: badge,
      detail: {
        rating: rating,
        rating_score: Math.round(ratingScore),
        total_terjual: totalTerjual,
        terjual_score: Math.round(terjualScore),
        konsistensi_review: Math.round(konsistensiReview),
        kecepatan_kirim: Math.round(kecepatanKirim),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET trust score untuk semua produk (opsional)
const getAllTrustScore = async (req, res) => {
  try {
    const produkResult = await pool.query(
      "SELECT id_produk, nama_produk, rata_rating, total_terjual FROM produk WHERE aktif = true",
    );

    const results = [];
    for (const produk of produkResult.rows) {
      // Hitung konsistensi review
      const konsistensiResult = await pool.query(
        `
                SELECT 
                    COUNT(CASE WHEN rating >= 4 THEN 1 END) as review_baik,
                    COUNT(*) as total_review
                FROM ulasan WHERE id_produk = $1
            `,
        [produk.id_produk],
      );

      const totalReview = parseInt(konsistensiResult.rows[0].total_review) || 0;
      const reviewBaik = parseInt(konsistensiResult.rows[0].review_baik) || 0;
      const konsistensiReview =
        totalReview > 0 ? (reviewBaik / totalReview) * 100 : 0;

      // Hitung skor
      const ratingScore = (produk.rata_rating / 5) * 100;
      const terjualScore = Math.min(100, (produk.total_terjual / 100) * 100);
      const trustScore =
        ratingScore * 0.4 + terjualScore * 0.3 + konsistensiReview * 0.2;

      results.push({
        id_produk: produk.id_produk,
        nama_produk: produk.nama_produk,
        trust_score: Math.round(trustScore),
      });
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTrustScoreProduk,
  getAllTrustScore,
};
