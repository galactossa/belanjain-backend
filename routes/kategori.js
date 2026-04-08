const express = require("express");
const router = express.Router();
const kategoriController = require("../controllers/kategori");
const { verifyToken, checkRole } = require("../middleware/auth");

// Public (semua orang bisa lihat kategori)
router.get("/", kategoriController.getAllKategori);
router.get("/:id", kategoriController.getKategoriById);

// Hanya admin yang bisa tambah/edit/hapus kategori
router.post(
  "/",
  verifyToken,
  checkRole(["admin"]),
  kategoriController.createKategori,
);
router.put(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  kategoriController.updateKategori,
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  kategoriController.deleteKategori,
);

module.exports = router;
