const { Pool } = require("pg");
require("dotenv").config();

let pool;

// Cek apakah menggunakan DATABASE_URL (Railway) atau variabel terpisah (Local)
if (process.env.DATABASE_URL) {
  // Production (Railway) - Pakai DATABASE_URL
  console.log("📦 Using DATABASE_URL for database connection");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else if (process.env.DB_HOST) {
  // Production dengan variabel terpisah
  console.log("📦 Using DB_HOST for database connection");
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // Local development
  console.log("📦 Using local database configuration");
  pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "BelanjaIn",
    password: "toraeld8",
    port: 5432,
  });
}

module.exports = pool;
