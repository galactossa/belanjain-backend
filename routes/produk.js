const express = require("express");
const router = express.Router();
const produkController = require("../controllers/produk");

router.get("/", produkController.getAllProduk);
router.get("/search", produkController.searchProduk);
router.get("/filter", produkController.filterProduk);
router.get("/:id", produkController.getProdukById);
router.get("/toko/:id_toko", produkController.getProdukByToko);
router.get("/kategori/:id_kategori", produkController.getProdukByKategori);
router.post("/", produkController.createProduk);
router.put("/:id", produkController.updateProduk);
router.delete("/:id", produkController.deleteProduk);

module.exports = router;
