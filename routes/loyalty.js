const express = require("express");
const router = express.Router();
const loyaltyController = require("../controllers/loyalty");
const { verifyToken } = require("../middleware/auth");

// Semua endpoint butuh login
router.get(
  "/points/pengguna/:id_pengguna",
  verifyToken,
  loyaltyController.getTotalPoints,
);
router.get(
  "/history/pengguna/:id_pengguna",
  verifyToken,
  loyaltyController.getPointHistory,
);
router.get(
  "/membership/pengguna/:id_pengguna",
  verifyToken,
  loyaltyController.getMembershipLevel,
);
router.post("/points", verifyToken, loyaltyController.addPoints);
router.put("/points/redeem", verifyToken, loyaltyController.redeemPoints);

module.exports = router;
