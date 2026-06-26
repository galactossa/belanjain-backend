const express = require("express");
const router = express.Router();
const statistikController = require("../controllers/statistik");
const { verifyToken, checkRole } = require("../middleware/auth");

// 🔥 ADMIN STATISTIK - HARUS PAKE checkRole(["admin"])
router.get(
  "/admin",
  verifyToken,
  checkRole(["admin"]),
  statistikController.getStatistikAdmin,
);

// Penjual lihat statistik tokonya sendiri
router.get(
  "/penjual/:id_toko",
  verifyToken,
  statistikController.getStatistikPenjual,
);

module.exports = router;
