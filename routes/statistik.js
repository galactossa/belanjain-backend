const express = require("express");
const router = express.Router();
const statistikController = require("../controllers/statistik");
const { verifyToken, checkRole } = require("../middleware/auth");

// Penjual lihat statistik tokonya sendiri
router.get(
  "/penjual/:id_toko",
  verifyToken,
  statistikController.getStatistikPenjual,
);

// Hanya admin
router.get(
  "/admin",
  verifyToken,
  checkRole(["admin"]),
  statistikController.getStatistikAdmin,
);

module.exports = router;
