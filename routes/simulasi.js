const express = require("express");
const router = express.Router();
const simulasiController = require("../controllers/simulasi");
const { verifyToken, checkRole } = require("../middleware/auth");

// Hanya admin yang bisa akses simulasi
router.post(
  "/real-data",
  verifyToken,
  checkRole(["admin"]),
  simulasiController.runRealDataSimulation,
);

router.post(
  "/manual",
  verifyToken,
  checkRole(["admin"]),
  simulasiController.runManualSimulation,
);

router.get(
  "/preview",
  verifyToken,
  checkRole(["admin"]),
  simulasiController.getHistoricalPreview,
);

module.exports = router;
