const jwt = require("jsonwebtoken");
const pool = require("../db/db");
const { success, error } = require("../middleware/responseFormatter");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_default_ganti_nanti";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id_pengguna,
      id_pengguna: user.id_pengguna,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

const googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}?error=auth_failed`,
      );
    }

    const user = req.user;
    const token = generateToken(user);

    // Kirim token sebagai query parameter ke frontend
    const redirectUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }?token=${token}`;

    console.log("✅ Google OAuth Success, redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google OAuth Callback Error:", err);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}?error=server_error`,
    );
  }
};

const googleStatus = async (req, res) => {
  if (!req.user) {
    return success(res, { isAuthenticated: false }, "Not authenticated");
  }

  return success(
    res,
    {
      isAuthenticated: true,
      user: {
        id_pengguna: req.user.id_pengguna,
        nama: req.user.nama,
        email: req.user.email,
        role: req.user.role,
        url_foto: req.user.url_foto,
      },
    },
    "Authenticated",
  );
};

const googleLogout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return error(res, "Logout failed", 500);
    }
    res.json({ status: "success", message: "Logged out successfully" });
  });
};

module.exports = { googleCallback, googleStatus, googleLogout };
