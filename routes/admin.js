const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const { verifyToken, checkRole } = require("../middleware/auth");

// Semua endpoint hanya untuk super admin
router.get("/", verifyToken, checkRole(["admin"]), adminController.getAllAdmin);
router.post(
  "/",
  verifyToken,
  checkRole(["admin"]),
  adminController.createAdmin,
);
router.put(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  adminController.updateAdmin,
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  adminController.deleteAdmin,
);

module.exports = router;
