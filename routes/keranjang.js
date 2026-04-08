const express = require("express");
const router = express.Router();
const keranjangController = require("../controllers/keranjang");

router.get(
  "/pengguna/:id_pengguna",
  keranjangController.getKeranjangByPengguna,
);
router.post("/", keranjangController.addToKeranjang);
router.put("/:id", keranjangController.updateKeranjang);
router.delete("/:id", keranjangController.deleteFromKeranjang);
router.delete(
  "/pengguna/:id_pengguna/clear",
  keranjangController.clearKeranjang,
);

module.exports = router;
