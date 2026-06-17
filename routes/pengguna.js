const express = require("express");
const router = express.Router();
const penggunaController = require("../controllers/pengguna");
const { verifyToken, checkRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

// ================= PUBLIC ROUTES (tanpa token) =================
router.get("/", penggunaController.getAllPengguna);
router.get("/role/:role", penggunaController.getPenggunaByRole);
router.post("/register", penggunaController.register);
router.post("/login", penggunaController.login);

// ================= 🔥 GET PROFILE SENDIRI DARI TOKEN =================
router.get("/me", verifyToken, penggunaController.getMe);

// ================= GET USER BY ID =================
router.get("/:id", penggunaController.getPenggunaById);

// ================= PROTECTED ROUTES (perlu token) =================
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

// ================= UPLOAD FOTO PROFIL =================
router.post(
  "/:id/upload-foto",
  verifyToken,
  upload.single("foto"),
  penggunaController.uploadFotoProfil,
);

module.exports = router;
