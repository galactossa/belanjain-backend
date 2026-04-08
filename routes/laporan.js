const express = require("express");
const router = express.Router();
const laporanController = require("../controllers/laporan");
const { verifyToken, checkRole } = require("../middleware/auth");

// Semua orang yang login bisa buat laporan
router.post("/", verifyToken, laporanController.createLaporan);

// Lihat laporan sendiri
router.get(
  "/pelapor/:id_pelapor",
  verifyToken,
  laporanController.getLaporanByPelapor,
);

// Hanya admin yang bisa lihat semua laporan dan validasi
router.get(
  "/",
  verifyToken,
  checkRole(["admin"]),
  laporanController.getAllLaporan,
);
router.put(
  "/:id/status",
  verifyToken,
  checkRole(["admin"]),
  laporanController.updateStatusLaporan,
);

module.exports = router;
