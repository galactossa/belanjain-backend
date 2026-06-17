const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_default_ganti_nanti";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Pastikan decoded memiliki id
    console.log("🔍 Decoded token:", decoded);

    // Simpan data user ke req.user dengan field yang konsisten
    req.user = {
      id: decoded.id || decoded.id_pengguna,
      id_pengguna: decoded.id || decoded.id_pengguna,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(403).json({
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Akses ditolak. Hanya untuk: " + roles.join(", "),
      });
    }

    next();
  };
};

module.exports = { verifyToken, checkRole };
