const express = require("express");
const router = express.Router();
const trustScoreController = require("../controllers/trustScore");

// Public (semua orang bisa lihat trust score)
router.get("/produk/:id_produk", trustScoreController.getTrustScoreProduk);
router.get("/semua", trustScoreController.getAllTrustScore);

module.exports = router;
