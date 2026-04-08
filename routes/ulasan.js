const express = require("express");
const router = express.Router();
const ulasanController = require("../controllers/ulasan");
const { verifyToken } = require("../middleware/auth");

// Public (semua orang bisa lihat ulasan produk)
router.get("/produk/:id_produk", ulasanController.getUlasanByProduk);

// Protected (hanya yang sudah login bisa kasih review)
router.post("/", verifyToken, ulasanController.createUlasan);

// Hapus ulasan (hanya pemilik ulasan atau admin)
// Catatan: Untuk keamanan lebih, sebaiknya tambahkan pengecekan pemilik di controller
router.delete("/:id", verifyToken, ulasanController.deleteUlasan);

module.exports = router;
