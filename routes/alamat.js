const express = require("express");
const router = express.Router();
const alamatController = require("../controllers/alamat");
const { verifyToken } = require("../middleware/auth");

// Semua endpoint alamat butuh login (karena data pribadi)
router.get(
  "/pengguna/:id_pengguna",
  verifyToken,
  alamatController.getAlamatByPengguna,
);
router.get("/:id", verifyToken, alamatController.getAlamatById);
router.post("/", verifyToken, alamatController.createAlamat);
router.put("/:id", verifyToken, alamatController.updateAlamat);
router.delete("/:id", verifyToken, alamatController.deleteAlamat);

module.exports = router;
