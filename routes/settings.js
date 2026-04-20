const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settings");
const { verifyToken, checkRole } = require("../middleware/auth");

// Public (bisa diakses semua orang)
router.get("/", settingsController.getAllSettings);
router.get("/:key", settingsController.getSettingByKey);

// Hanya admin
router.post(
  "/",
  verifyToken,
  checkRole(["admin"]),
  settingsController.createSetting,
);
router.put(
  "/:key",
  verifyToken,
  checkRole(["admin"]),
  settingsController.updateSetting,
);
router.delete(
  "/:key",
  verifyToken,
  checkRole(["admin"]),
  settingsController.deleteSetting,
);

module.exports = router;
