const express = require("express");
const router = express.Router();
const passport = require("passport");
const googleAuthController = require("../controllers/googleAuth");
const { verifyToken } = require("../middleware/auth");

// Redirect ke Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Callback dari Google
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleAuthController.googleCallback,
);

// Cek status login
router.get("/status", verifyToken, googleAuthController.googleStatus);

// Logout
router.post("/logout", googleAuthController.googleLogout);

module.exports = router;
