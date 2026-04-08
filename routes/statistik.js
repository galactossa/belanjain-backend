const express = require("express");
const router = express.Router();
const statistikController = require("../controllers/statistik");

router.get("/penjual/:id_toko", statistikController.getStatistikPenjual);
router.get("/admin", statistikController.getStatistikAdmin);

module.exports = router;
