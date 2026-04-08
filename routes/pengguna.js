const express = require("express");
const router = express.Router();
const penggunaController = require("../controllers/pengguna");

router.get("/", penggunaController.getAllPengguna);
router.get("/:id", penggunaController.getPenggunaById);
router.get("/role/:role", penggunaController.getPenggunaByRole);
router.post("/register", penggunaController.register);
router.post("/login", penggunaController.login);
router.put("/:id", penggunaController.updatePengguna);
router.put("/:id/role", penggunaController.updateRolePengguna);
router.delete("/:id", penggunaController.deletePengguna);

module.exports = router;
