const express = require("express");
const router = express.Router();
const ulasanController = require("../controllers/ulasan");

router.get("/produk/:id_produk", ulasanController.getUlasanByProduk);
router.post("/", ulasanController.createUlasan);
router.delete("/:id", ulasanController.deleteUlasan);

module.exports = router;
