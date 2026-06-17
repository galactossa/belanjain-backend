const express = require("express");
const router = express.Router();
const saldoController = require("../controllers/saldo");
const { verifyToken } = require("../middleware/auth");

// Semua endpoint butuh login
router.get("/:id_pengguna", verifyToken, saldoController.getSaldo);
router.post("/topup", verifyToken, saldoController.topupSaldo);
router.get(
  "/history/:id_pengguna",
  verifyToken,
  saldoController.getSaldoHistory,
);
router.post("/kurangi", verifyToken, saldoController.kurangiSaldo);

module.exports = router;
