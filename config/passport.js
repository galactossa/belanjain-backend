const passport = require("passport");
const pool = require("../db/db");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Serialize user ke session
passport.serializeUser((user, done) => {
  done(null, user.id_pengguna);
});

// Deserialize user dari session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      "SELECT id_pengguna, nama, email, role, telepon, url_foto, aktif FROM pengguna WHERE id_pengguna = $1",
      [id],
    );
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// ============================================
// GOOGLE OAUTH - HANYA JALAN JIKA CREDENTIALS ADA
// ============================================

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (
  GOOGLE_CLIENT_ID &&
  GOOGLE_CLIENT_SECRET &&
  GOOGLE_CLIENT_ID !== "undefined"
) {
  console.log("✅ Google OAuth ENABLED");
  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;

          if (!email) {
            return done(new Error("No email found from Google account"), null);
          }

          const existingUser = await pool.query(
            "SELECT * FROM pengguna WHERE email = $1",
            [email],
          );

          if (existingUser.rows.length > 0) {
            const user = existingUser.rows[0];

            if (!user.google_id) {
              await pool.query(
                "UPDATE pengguna SET google_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id_pengguna = $2",
                [profile.id, user.id_pengguna],
              );
            }

            return done(null, user);
          }

          const nama = profile.displayName || email.split("@")[0];
          const foto =
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null;
          const randomPassword = Math.random().toString(36).slice(-16);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          const result = await pool.query(
            `INSERT INTO pengguna (nama, email, password, role, url_foto, google_id, aktif) 
             VALUES ($1, $2, $3, $4, $5, $6, true) 
             RETURNING id_pengguna, nama, email, role, url_foto`,
            [nama, email, hashedPassword, "pembeli", foto, profile.id],
          );

          return done(null, result.rows[0]);
        } catch (err) {
          console.error("Google OAuth error:", err);
          return done(err, null);
        }
      },
    ),
  );
} else {
  console.warn("⚠️ Google OAuth DISABLED - Missing credentials in environment");
  console.warn("   GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID ? "set" : "missing");
  console.warn(
    "   GOOGLE_CLIENT_SECRET:",
    GOOGLE_CLIENT_SECRET ? "set" : "missing",
  );
}

module.exports = passport;
