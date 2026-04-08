const jwt = require("jsonwebtoken");

// Secret key untuk JWT (ambil dari .env, atau pakai default)
const JWT_SECRET = process.env.JWT_SECRET || "rahasia_default_ganti_nanti";

// Middleware 1: Verifikasi token
const verifyToken = (req, res, next) => {
  // Ambil header Authorization
  const authHeader = req.headers.authorization;

  // Cek apakah header ada dan formatnya benar
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  // Ambil tokennya saja (hapus kata "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Simpan data user ke req.user
    req.user = decoded;
    next(); // Lanjut ke route berikutnya
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Token tidak valid atau sudah kadaluarsa" });
  }
};

// Middleware 2: Cek role (admin, penjual, pembeli)
const checkRole = (roles) => {
  return (req, res, next) => {
    // Pastikan user sudah login (req.user ada)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Cek apakah role user termasuk dalam roles yang diizinkan
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Akses ditolak. Hanya untuk: " + roles.join(", "),
      });
    }

    next();
  };
};

module.exports = { verifyToken, checkRole };
