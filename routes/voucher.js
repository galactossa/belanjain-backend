const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucher");

router.get("/", voucherController.getAllVoucher);
router.get("/admin", voucherController.getAllVoucherAdmin);
router.get("/:id", voucherController.getVoucherById);
router.get("/kode/:kode", voucherController.getVoucherByKode);
router.post("/", voucherController.createVoucher);
router.put("/:id", voucherController.updateVoucher);
router.delete("/:id", voucherController.deleteVoucher);

module.exports = router;
