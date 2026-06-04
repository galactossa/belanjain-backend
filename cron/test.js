const {
  checkDiscountedWishlist,
  checkOldWishlist,
  checkLowStock,
  deleteExpiredWishlist,
} = require("./wishlistReminder");

async function test() {
  console.log("=== TESTING CRON JOBS ===");
  await checkDiscountedWishlist();
  await checkOldWishlist();
  await checkLowStock();
  await deleteExpiredWishlist();
  console.log("=== TESTING COMPLETE ===");
  process.exit();
}

test();
