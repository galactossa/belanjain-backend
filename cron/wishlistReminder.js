const pool = require("../db/db");
const fetch = require("node-fetch");

// Konfigurasi
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || null; // opsional untuk logging

// Fungsi untuk mengirim notifikasi
const sendNotification = async (id_pengguna, judul, pesan, tipe) => {
  try {
    await pool.query(
      `INSERT INTO notifikasi (id_pengguna, judul, pesan, tipe) 
             VALUES ($1, $2, $3, $4)`,
      [id_pengguna, judul, pesan, tipe || "wishlist_reminder"],
    );

    // Log ke console
    console.log(`[NOTIF SENT] To user ${id_pengguna}: ${judul}`);

    // Optional: kirim ke Discord webhook untuk monitoring
    if (DISCORD_WEBHOOK_URL) {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🔔 Wishlist Reminder sent to user ${id_pengguna}\n📝 ${judul}\n${pesan}`,
        }),
      });
    }
  } catch (err) {
    console.error(
      `Failed to send notification to user ${id_pengguna}:`,
      err.message,
    );
  }
};

// =====================================================
// 1. SMART WISHLIST REMINDER
// =====================================================
// Cek produk di wishlist yang sedang diskon
const checkDiscountedWishlist = async () => {
  console.log("[CRON] Running Smart Wishlist Reminder check...");

  try {
    // Cari wishlist yang produknya sedang diskon (voucher aktif)
    const result = await pool.query(`
            SELECT DISTINCT 
                w.id_pengguna, 
                w.id_produk, 
                p.nama_produk,
                v.kode as voucher_kode,
                v.tipe_diskon,
                v.nilai_diskon
            FROM wishlist w
            JOIN produk p ON w.id_produk = p.id_produk
            JOIN voucher v ON v.aktif = true 
                AND v.berlaku_dari <= CURRENT_DATE 
                AND v.berlaku_sampai >= CURRENT_DATE
            WHERE p.aktif = true
            AND NOT EXISTS (
                SELECT 1 FROM notifikasi n 
                WHERE n.id_pengguna = w.id_pengguna 
                AND n.tipe = 'diskon_wishlist'
                AND n.created_at > NOW() - INTERVAL '7 days'
            )
        `);

    for (const item of result.rows) {
      let diskonText = "";
      if (item.tipe_diskon === "persen") {
        diskonText = `${item.nilai_diskon}%`;
      } else {
        diskonText = `Rp${parseInt(item.nilai_diskon).toLocaleString()}`;
      }

      await sendNotification(
        item.id_pengguna,
        `🔥 Disksn untuk produk favoritmu!`,
        `Produk "${item.nama_produk}" sedang mendapatkan diskon ${diskonText}! Gunakan kode ${item.voucher_kode} sekarang.`,
        "diskon_wishlist",
      );
    }

    console.log(
      `[CRON] Wishlist discount reminder: ${result.rows.length} notifications sent`,
    );
  } catch (err) {
    console.error("[CRON] Error checking discounted wishlist:", err);
  }
};

// =====================================================
// 2. SMART WISHLIST REMINDER (Produk lama di wishlist)
// =====================================================
// Cek produk di wishlist yang sudah disimpan lebih dari 7 hari
const checkOldWishlist = async () => {
  console.log("[CRON] Running Old Wishlist Reminder check...");

  try {
    const result = await pool.query(`
            SELECT 
                w.id_pengguna,
                w.id_produk,
                p.nama_produk,
                p.harga,
                EXTRACT(DAY FROM (NOW() - w.created_at)) as hari_tersimpan
            FROM wishlist w
            JOIN produk p ON w.id_produk = p.id_produk
            WHERE p.aktif = true
            AND w.created_at < NOW() - INTERVAL '7 days'
            AND NOT EXISTS (
                SELECT 1 FROM notifikasi n 
                WHERE n.id_pengguna = w.id_pengguna 
                AND n.tipe = 'wishlist_expiry_warning'
                AND n.created_at > NOW() - INTERVAL '3 days'
                AND n.data->>'id_produk' = w.id_produk::text
            )
        `);

    for (const item of result.rows) {
      await sendNotification(
        item.id_pengguna,
        `⏰ Jangan sampai kehabisan!`,
        `Produk "${item.nama_produk}" sudah ${Math.round(item.hari_tersimpan)} hari di wishlistmu. Stok terbatas, segera checkout!`,
        "wishlist_expiry_warning",
      );
    }

    console.log(
      `[CRON] Old wishlist reminder: ${result.rows.length} notifications sent`,
    );
  } catch (err) {
    console.error("[CRON] Error checking old wishlist:", err);
  }
};

// =====================================================
// 3. ALERT STOK MENIPIS (Low Stock)
// =====================================================
// Cek produk dengan stok di bawah batas minimum
const checkLowStock = async () => {
  console.log("[CRON] Running Low Stock Alert check...");

  const MIN_STOCK_THRESHOLD = 5; // stok kurang dari 5

  try {
    const result = await pool.query(
      `
            SELECT 
                p.id_produk,
                p.nama_produk,
                p.stok,
                t.id_pengguna as seller_id,
                t.nama_toko,
                p.created_at
            FROM produk p
            JOIN toko t ON p.id_toko = t.id_toko
            WHERE p.aktif = true 
            AND p.stok < $1
            AND p.stok >= 0
            AND NOT EXISTS (
                SELECT 1 FROM notifikasi n 
                WHERE n.id_pengguna = t.id_pengguna 
                AND n.tipe = 'low_stock'
                AND n.created_at > NOW() - INTERVAL '1 day'
                AND n.data->>'id_produk' = p.id_produk::text
            )
        `,
      [MIN_STOCK_THRESHOLD],
    );

    for (const item of result.rows) {
      let pesan = `⚠️ Stok produk "${item.nama_produk}" tersisa ${item.stok} unit. Segera restock!`;
      if (item.stok <= 0) {
        pesan = `❌ Produk "${item.nama_produk}" sudah habis. Segera restock!`;
      }

      await sendNotification(
        item.seller_id,
        `📦 Peringatan Stok Menipis`,
        pesan,
        "low_stock",
      );
    }

    console.log(
      `[CRON] Low stock alert: ${result.rows.length} notifications sent`,
    );
  } catch (err) {
    console.error("[CRON] Error checking low stock:", err);
  }
};

// =====================================================
// 4. WISHLIST EXPIRY (Hapus wishlist kadaluarsa)
// =====================================================
// Hapus produk dari wishlist yang sudah disimpan lebih dari 30 hari
const deleteExpiredWishlist = async () => {
  console.log("[CRON] Running Wishlist Expiry deletion...");

  const EXPIRY_DAYS = 30;

  try {
    // Catat wishlist yang akan dihapus untuk notifikasi
    const toDelete = await pool.query(`
            SELECT 
                w.id_wishlist,
                w.id_pengguna,
                p.nama_produk,
                EXTRACT(DAY FROM (NOW() - w.created_at)) as hari_tersimpan
            FROM wishlist w
            JOIN produk p ON w.id_produk = p.id_produk
            WHERE w.created_at < NOW() - INTERVAL '${EXPIRY_DAYS} days'
        `);

    // Kirim notifikasi sebelum hapus
    for (const item of toDelete.rows) {
      await sendNotification(
        item.id_pengguna,
        `🗑️ Produk dihapus dari wishlist`,
        `Produk "${item.nama_produk}" telah dihapus dari wishlist karena sudah ${Math.round(item.hari_tersimpan)} hari tidak dibeli.`,
        "wishlist_expired",
      );
    }

    // Hapus wishlist yang kadaluarsa
    const result = await pool.query(`
            DELETE FROM wishlist 
            WHERE created_at < NOW() - INTERVAL '${EXPIRY_DAYS} days'
            RETURNING id_wishlist
        `);

    console.log(
      `[CRON] Wishlist expiry: ${result.rows.length} items deleted (${toDelete.rows.length} notified)`,
    );
  } catch (err) {
    console.error("[CRON] Error deleting expired wishlist:", err);
  }
};

// =====================================================
// EKSPOR SEMUA FUNGSI
// =====================================================
module.exports = {
  checkDiscountedWishlist,
  checkOldWishlist,
  checkLowStock,
  deleteExpiredWishlist,
};
