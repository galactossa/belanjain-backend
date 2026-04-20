const express = require("express");
const router = express.Router();
const produkController = require("../controllers/produk");
const { verifyToken, checkRole } = require("../middleware/auth");

// Public (semua orang bisa lihat produk)
router.get("/", produkController.getAllProduk);
router.get("/search", produkController.searchProduk);
router.get("/filter", produkController.filterProduk);
router.get("/:id", produkController.getProdukById);
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

module.exports = router;
