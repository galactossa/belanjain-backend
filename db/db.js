const { Pool } = require("pg");
require("dotenv").config();

// 🔥 CEK ENVIRONMENT
const isProduction = process.env.NODE_ENV === "production";

let poolConfig;

if (isProduction) {
  // 🔥 PRODUCTION (Railway) - pakai DATABASE_URL
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  // 🔥 DEVELOPMENT (Localhost) - pakai parameter terpisah
  poolConfig = {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "BelanjaIn1",
    password: process.env.DB_PASSWORD || "toraeld8",
    port: parseInt(process.env.DB_PORT) || 5432,
  };
}

const pool = new Pool(poolConfig);

// 🔥 TEST KONEKSI (opsional, buat debugging)
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection error:", err.stack);
  } else {
    console.log("✅ Database connected successfully!");
    release();
  }
});

module.exports = pool;
