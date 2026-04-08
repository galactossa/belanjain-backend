const express = require("express");
const router = express.Router();
const notifikasiController = require("../controllers/notifikasi");

router.get(
  "/pengguna/:id_pengguna",
  notifikasiController.getNotifikasiByPengguna,
);
router.get(
  "/pengguna/:id_pengguna/unread",
  notifikasiController.getNotifikasiBelumDibaca,
);
router.put("/:id/read", notifikasiController.markAsRead);
router.put(
  "/pengguna/:id_pengguna/read-all",
  notifikasiController.markAllAsRead,
);
router.post("/broadcast", notifikasiController.broadcastNotifikasi);

module.exports = router;
