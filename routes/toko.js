const express = require("express");
const router = express.Router();
const tokoController = require("../controllers/toko");
const { verifyToken, checkRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

// PUBLIC ROUTES (tanpa token)
router.get("/", tokoController.getAllToko);
router.get("/:id", tokoController.getTokoById);
router.get("/:id_toko/produk", tokoController.getProdukByToko);
router.get("/user/:userId", verifyToken, tokoController.getTokoByUser);

// PROTECTED ROUTES (butuh login)
router.post("/", verifyToken, tokoController.createToko);
router.put("/:id", verifyToken, tokoController.updateToko);

// Upload logo toko (hanya penjual/admin)
router.post(
  "/:id/upload-logo",
  verifyToken,
  checkRole(["penjual", "admin"]),
  upload.single("logo"),
  tokoController.uploadLogoToko,
);

// Upload banner toko (hanya penjual/admin)
router.post(
  "/:id/upload-banner",
  verifyToken,
  checkRole(["penjual", "admin"]),
  upload.single("banner"),
  tokoController.uploadBannerToko,
);

module.exports = router;
