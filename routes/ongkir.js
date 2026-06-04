const express = require("express");
const router = express.Router();
const ongkirController = require("../controllers/ongkir");
const { verifyToken } = require("../middleware/auth");

// Semua endpoint ongkir butuh login
router.post("/cost", verifyToken, ongkirController.checkOngkir);
router.get(
  "/tracking/:tracking_id",
  verifyToken,
  ongkirController.checkTracking,
);
router.get("/search-area", verifyToken, ongkirController.searchArea);

module.exports = router;
