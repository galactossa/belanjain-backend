const express = require("express");
const router = express.Router();
const pesananController = require("../controllers/pesanan");

router.get("/pengguna/:id_pengguna", pesananController.getPesananByPengguna);
router.get("/toko/:id_toko", pesananController.getPesananByToko);
router.get("/:id", pesananController.getPesananById);
router.post("/", pesananController.createPesanan);
router.put("/:id/status", pesananController.updateStatusPesanan);
router.put("/:id/pembayaran", pesananController.updatePembayaran);

module.exports = router;
