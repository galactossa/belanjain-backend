const express = require("express");
const router = express.Router();
const transaksiController = require("../controllers/transaksi");
const { verifyToken, checkRole } = require("../middleware/auth");

// Hanya admin yang bisa lihat semua transaksi
router.get(
  "/",
  verifyToken,
  checkRole(["admin"]),
  transaksiController.getAllTransaksi,
);

// User bisa lihat transaksi sendiri (perlu tambahan logika nanti)
router.get(
  "/pengguna/:id_pengguna",
  verifyToken,
  transaksiController.getTransaksiByPengguna,
);
router.get("/:id", verifyToken, transaksiController.getTransaksiById);

module.exports = router;
