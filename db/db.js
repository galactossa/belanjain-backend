const { Pool } = require("pg");
require("dotenv").config();

// 🔥 PAKAI DATABASE_URL DARI ENVIRONMENT (RAILWAY)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // PENTING UNTUK RAILWAY
  },
});

module.exports = pool;
