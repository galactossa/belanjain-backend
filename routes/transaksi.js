const express = require("express");
const router = express.Router();
const transaksiController = require("../controllers/transaksi");

router.get("/", transaksiController.getAllTransaksi);
router.get(
  "/pengguna/:id_pengguna",
  transaksiController.getTransaksiByPengguna,
);
router.get("/:id", transaksiController.getTransaksiById);

module.exports = router;
