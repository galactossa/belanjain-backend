const express = require("express");
const router = express.Router();
const rekomendasiController = require("../controllers/rekomendasi");
const { verifyToken, checkRole } = require("../middleware/auth");

// Hanya penjual/admin yang bisa melihat rekomendasi harga untuk produk mereka
router.get(
  "/harga/:id_produk",
  verifyToken,
  checkRole(["penjual", "admin"]),
  rekomendasiController.getRekomendasiHarga,
);

module.exports = router;
