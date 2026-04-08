const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucher");
const { verifyToken, checkRole } = require("../middleware/auth");

// Public (semua orang bisa lihat voucher yang aktif)
router.get("/", voucherController.getAllVoucher);
router.get("/kode/:kode", voucherController.getVoucherByKode);
router.get("/:id", voucherController.getVoucherById);

// Hanya admin yang bisa lihat semua voucher (termasuk nonaktif)
router.get(
  "/admin",
  verifyToken,
  checkRole(["admin"]),
  voucherController.getAllVoucherAdmin,
);

// Hanya admin yang bisa tambah/edit/hapus voucher
router.post(
  "/",
  verifyToken,
  checkRole(["admin"]),
  voucherController.createVoucher,
);
router.put(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  voucherController.updateVoucher,
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  voucherController.deleteVoucher,
);

module.exports = router;
