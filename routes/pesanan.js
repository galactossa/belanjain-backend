const express = require("express");
const router = express.Router();
const pesananController = require("../controllers/pesanan");
const { verifyToken, checkRole } = require("../middleware/auth");

// Semua endpoint pesanan butuh login
router.get(
  "/pengguna/:id_pengguna",
  verifyToken,
  pesananController.getPesananByPengguna,
);
router.get("/:id", verifyToken, pesananController.getPesananById);
router.post("/", verifyToken, pesananController.createPesanan);
router.put("/:id/pembayaran", verifyToken, pesananController.updatePembayaran);

// Lihat pesanan masuk toko (penjual atau admin)
router.get(
  "/toko/:id_toko",
  verifyToken,
  checkRole(["penjual", "admin"]),
  pesananController.getPesananByToko,
);

// Update status pesanan (penjual atau admin)
router.put(
  "/:id/status",
  verifyToken,
  checkRole(["penjual", "admin"]),
  pesananController.updateStatusPesanan,
);

module.exports = router;
