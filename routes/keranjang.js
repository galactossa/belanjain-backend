const express = require("express");
const router = express.Router();
const keranjangController = require("../controllers/keranjang");
const { verifyToken } = require("../middleware/auth");

// Semua endpoint keranjang butuh login (karena data pribadi pengguna)

// Lihat isi keranjang pengguna
router.get(
  "/pengguna/:id_pengguna",
  verifyToken,
  keranjangController.getKeranjangByPengguna,
);

// Tambah produk ke keranjang
router.post("/", verifyToken, keranjangController.addToKeranjang);

// Update jumlah produk di keranjang
router.put("/:id", verifyToken, keranjangController.updateKeranjang);

// Hapus satu item dari keranjang
router.delete("/:id", verifyToken, keranjangController.deleteFromKeranjang);

// Kosongkan seluruh keranjang
router.delete(
  "/pengguna/:id_pengguna/clear",
  verifyToken,
  keranjangController.clearKeranjang,
);

module.exports = router;
