const express = require("express");
const router = express.Router();
const transaksiController = require("../controllers/transaksi");
const { verifyToken, checkRole } = require("../middleware/auth");

// 🔥 Admin bisa lihat semua transaksi
router.get(
  "/",
  verifyToken,
  checkRole(["admin"]),
  transaksiController.getAllTransaksi,
);

// User bisa lihat transaksi sendiri
router.get(
  "/pengguna/:id_pengguna",
  verifyToken,
  transaksiController.getTransaksiByPengguna,
);

// Detail transaksi (admin atau pemilik)
router.get("/:id", verifyToken, transaksiController.getTransaksiById);

module.exports = router;
