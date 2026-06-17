const { Pool } = require("pg");
require("dotenv").config();

// Konfigurasi database lokal
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "BelanjaIn1",
  password: "toraeld8",
  port: 5432,
});

module.exports = pool;
