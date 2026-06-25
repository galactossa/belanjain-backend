const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_default_ganti_nanti";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("🔍 Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("🔍 Decoded token:", JSON.stringify(decoded, null, 2));

    // 🔥 PASTIKAN ROLE TERBACA
    req.user = {
      id: decoded.id || decoded.id_pengguna,
      id_pengguna: decoded.id || decoded.id_pengguna,
      email: decoded.email,
      role: decoded.role || "pembeli",
    };

    console.log("🔍 req.user setelah verify:", req.user);

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
    console.log("🔍 checkRole - req.user:", req.user);
    console.log("🔍 checkRole - required roles:", roles);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user" });
    }

    console.log("🔍 checkRole - user role:", req.user.role);
    console.log(
      "🔍 checkRole - roles includes?",
      roles.includes(req.user.role),
    );

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Akses ditolak. Hanya untuk: ${roles.join(", ")}. Role Anda: ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = { verifyToken, checkRole };
