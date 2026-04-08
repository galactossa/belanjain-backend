const express = require("express");
const router = express.Router();
const tokoController = require("../controllers/toko");

router.get("/", tokoController.getAllToko);
router.get("/:id", tokoController.getTokoById);
router.get("/:id_toko/produk", tokoController.getProdukByToko);
router.post("/", tokoController.createToko);
router.put("/:id", tokoController.updateToko);

module.exports = router;
