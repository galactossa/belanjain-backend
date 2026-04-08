const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist");

router.get("/pengguna/:id_pengguna", wishlistController.getWishlistByPengguna);
router.get("/cek/:id_pengguna/:id_produk", wishlistController.cekWishlist);
router.post("/", wishlistController.addToWishlist);
router.delete(
  "/:id_pengguna/:id_produk",
  wishlistController.removeFromWishlist,
);

module.exports = router;
