const express = require("express");
const router = express.Router();
const laporanController = require("../controllers/laporan");

router.get("/pelapor/:id_pelapor", laporanController.getLaporanByPelapor);
router.get("/", laporanController.getAllLaporan);
router.post("/", laporanController.createLaporan);
router.put("/:id/status", laporanController.updateStatusLaporan);

module.exports = router;
