const express = require("express");
const router = express.Router();
const produkController = require("../controllers/produk");
const { verifyToken, checkRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public (semua orang bisa lihat produk)
router.get("/", produkController.getAllProduk);
router.get("/search", produkController.searchProduk);
router.get("/filter", produkController.filterProduk);
router.get("/:id", produkController.getProdukById);
router.get("/:id/trend", produkController.getTrendProduk);
router.get("/toko/:id_toko", produkController.getProdukByToko);
router.get("/kategori/:id_kategori", produkController.getProdukByKategori);
router.get("/suggestions", produkController.getSearchSuggestions);

// Hanya penjual atau admin yang bisa tambah/edit/hapus produk
router.post(
  "/",
  verifyToken,
  checkRole(["penjual", "admin"]),
  produkController.createProduk,
);
router.put(
  "/:id",
  verifyToken,
  checkRole(["penjual", "admin"]),
  produkController.updateProduk,
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["penjual", "admin"]),
  produkController.deleteProduk,
);

// Upload gambar produk (penjual/admin)
router.post(
  "/:id/upload-gambar",
  verifyToken,
  checkRole(["penjual", "admin"]),
  upload.single("gambar"),
  produkController.uploadGambarProduk,
);

// Galeri produk
router.post(
  "/:id/galeri",
  verifyToken,
  checkRole(["penjual", "admin"]),
  upload.single("gambar"),
  produkController.addGaleriProduk,
);
router.get("/:id/galeri", produkController.getGaleriProduk);
router.delete(
  "/galeri/:id_image",
  verifyToken,
  checkRole(["penjual", "admin"]),
  produkController.deleteGaleriProduk,
);

module.exports = router;
