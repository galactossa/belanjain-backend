const express = require("express");
const router = express.Router();
const followController = require("../controllers/follow");
const { verifyToken } = require("../middleware/auth");

// Semua endpoint butuh login
router.post("/", verifyToken, followController.followToko);
router.delete(
  "/:id_pengguna/:id_toko",
  verifyToken,
  followController.unfollowToko,
);
router.get(
  "/following/:id_pengguna",
  verifyToken,
  followController.getFollowing,
);
router.get(
  "/cek/:id_pengguna/:id_toko",
  verifyToken,
  followController.cekFollow,
);

module.exports = router;
