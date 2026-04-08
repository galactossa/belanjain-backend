const express = require("express");
const router = express.Router();
const notifikasiController = require("../controllers/notifikasi");
const { verifyToken, checkRole } = require("../middleware/auth");

// Semua notifikasi butuh login
router.get(
  "/pengguna/:id_pengguna",
  verifyToken,
  notifikasiController.getNotifikasiByPengguna,
);
router.get(
  "/pengguna/:id_pengguna/unread",
  verifyToken,
  notifikasiController.getNotifikasiBelumDibaca,
);
router.put("/:id/read", verifyToken, notifikasiController.markAsRead);
router.put(
  "/pengguna/:id_pengguna/read-all",
  verifyToken,
  notifikasiController.markAllAsRead,
);

// Broadcast hanya admin
router.post(
  "/broadcast",
  verifyToken,
  checkRole(["admin"]),
  notifikasiController.broadcastNotifikasi,
);

module.exports = router;
