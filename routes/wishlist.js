const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist");
const { verifyToken } = require("../middleware/auth");

// Semua endpoint wishlist butuh login (karena data pribadi pengguna)

// Lihat semua wishlist milik pengguna tertentu
router.get(
  "/pengguna/:id_pengguna",
  verifyToken,
  wishlistController.getWishlistByPengguna,
);

// Cek apakah produk sudah ada di wishlist
router.get(
  "/cek/:id_pengguna/:id_produk",
  verifyToken,
  wishlistController.cekWishlist,
);

// Tambah produk ke wishlist
router.post("/", verifyToken, wishlistController.addToWishlist);

// Hapus produk dari wishlist
router.delete(
  "/:id_pengguna/:id_produk",
  verifyToken,
  wishlistController.removeFromWishlist,
);

module.exports = router;
