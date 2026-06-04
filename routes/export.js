const express = require("express");
const router = express.Router();
const exportController = require("../controllers/export");
const { verifyToken, checkRole } = require("../middleware/auth");

// Export laporan penjualan (hanya admin)
router.get(
  "/penjualan/excel",
  verifyToken,
  checkRole(["admin"]),
  exportController.exportPenjualanExcel,
);
router.get(
  "/penjualan/pdf",
  verifyToken,
  checkRole(["admin"]),
  exportController.exportPenjualanPdf,
);
router.get(
  "/produk-terlaris/excel",
  verifyToken,
  checkRole(["admin"]),
  exportController.exportProdukTerlarisExcel,
);

module.exports = router;
