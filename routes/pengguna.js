const express = require("express");
const router = express.Router();
const penggunaController = require("../controllers/pengguna");
const { verifyToken, checkRole } = require("../middleware/auth");

// ========== PUBLIC ROUTES (tanpa token) ==========
router.get("/", penggunaController.getAllPengguna);
router.get("/:id", penggunaController.getPenggunaById);
router.get("/role/:role", penggunaController.getPenggunaByRole);
router.post("/register", penggunaController.register);
router.post("/login", penggunaController.login);

// ========== PROTECTED ROUTES (perlu token) ==========
router.put("/:id", verifyToken, penggunaController.updatePengguna);
router.put(
  "/:id/role",
  verifyToken,
  checkRole(["admin"]),
  penggunaController.updateRolePengguna,
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  penggunaController.deletePengguna,
);

module.exports = router;
