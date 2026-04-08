const express = require("express");
const router = express.Router();
const alamatController = require("../controllers/alamat");

router.get("/pengguna/:id_pengguna", alamatController.getAlamatByPengguna);
router.get("/:id", alamatController.getAlamatById);
router.post("/", alamatController.createAlamat);
router.put("/:id", alamatController.updateAlamat);
router.delete("/:id", alamatController.deleteAlamat);

module.exports = router;
