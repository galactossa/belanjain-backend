const cron = require("node-cron");
const {
  checkDiscountedWishlist,
  checkOldWishlist,
  checkLowStock,
  deleteExpiredWishlist,
} = require("./wishlistReminder");

// JADWAL CRON JOBS

// 1. Cek wishlist diskon - setiap hari jam 08:00, 12:00, 18:00
cron.schedule("0 8,12,18 * * *", () => {
  console.log("[SCHEDULER] Running checkDiscountedWishlist...");
  checkDiscountedWishlist();
});

// 2. Cek wishlist lama - setiap hari jam 09:00
cron.schedule("0 9 * * *", () => {
  console.log("[SCHEDULER] Running checkOldWishlist...");
  checkOldWishlist();
});

// 3. Cek stok menipis - setiap hari jam 07:00, 14:00, 20:00
cron.schedule("0 7,14,20 * * *", () => {
  console.log("[SCHEDULER] Running checkLowStock...");
  checkLowStock();
});

// 4. Hapus wishlist kadaluarsa - setiap hari Minggu jam 01:00
cron.schedule("0 1 * * 0", () => {
  console.log("[SCHEDULER] Running deleteExpiredWishlist...");
  deleteExpiredWishlist();
});

console.log("[SCHEDULER] All cron jobs started successfully!");
console.log("  - Wishlist discount check: 08:00, 12:00, 18:00");
console.log("  - Old wishlist reminder: 09:00");
console.log("  - Low stock alert: 07:00, 14:00, 20:00");
console.log("  - Wishlist expiry deletion: Every Sunday at 01:00");
