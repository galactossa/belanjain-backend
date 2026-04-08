const express = require("express");
const router = express.Router();
const tokoController = require("../controllers/toko");
const { verifyToken, checkRole } = require("../middleware/auth");

// ========== PUBLIC ROUTES (tanpa token) ==========
// Semua orang bisa lihat daftar toko
router.get("/", tokoController.getAllToko);

// Lihat detail toko
router.get("/:id", tokoController.getTokoById);

// Lihat semua produk dari suatu toko
router.get("/:id_toko/produk", tokoController.getProdukByToko);

// ========== PROTECTED ROUTES (butuh login) ==========

// Upgrade dari pembeli menjadi penjual (buat toko baru)
router.post("/", verifyToken, tokoController.createToko);

// Edit profil toko (hanya pemilik toko yang bisa)
// Catatan: Untuk keamanan lebih, sebaiknya tambahkan pengecekan pemilik di controller
router.put("/:id", verifyToken, tokoController.updateToko);

module.exports = router;
