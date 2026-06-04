const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment");
const { verifyToken, checkRole } = require("../middleware/auth");

// ========== PUBLIC WEBHOOK (dari payment gateway) ==========
router.post("/webhook", paymentController.paymentWebhook);

// ========== PROTECTED ROUTES (butuh login) ==========
// Get metode pembayaran yang tersedia
router.get("/methods", verifyToken, paymentController.getPaymentMethods);

// Buat transaksi pembayaran (VA atau QRIS)
router.post("/create", verifyToken, paymentController.createPayment);

// Cek status pembayaran
router.get(
  "/status/:payment_id",
  verifyToken,
  paymentController.checkPaymentStatus,
);

// Batalkan pembayaran
router.post(
  "/cancel/:payment_id",
  verifyToken,
  paymentController.cancelPayment,
);

module.exports = router;
