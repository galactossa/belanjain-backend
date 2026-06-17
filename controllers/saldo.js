const pool = require("../db/db");
const {
  success,
  error,
  badRequest,
} = require("../middleware/responseFormatter");

// GET saldo by pengguna
const getSaldo = async (req, res) => {
  const { id_pengguna } = req.params;

  try {
    let result = await pool.query(
      "SELECT * FROM saldo WHERE id_pengguna = $1",
      [id_pengguna],
    );

    if (result.rows.length === 0) {
      const newSaldo = await pool.query(
        "INSERT INTO saldo (id_pengguna, saldo) VALUES ($1, 0) RETURNING *",
        [id_pengguna],
      );
      return success(res, newSaldo.rows[0], "Saldo retrieved");
    }

    return success(res, result.rows[0], "Saldo retrieved");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST topup saldo
const topupSaldo = async (req, res) => {
  const { id_pengguna, jumlah, metode } = req.body;

  if (!id_pengguna || !jumlah || jumlah < 10000) {
    return badRequest(res, "Minimal topup Rp10.000");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert history
    await client.query(
      `INSERT INTO saldo_history (id_pengguna, jenis, jumlah, deskripsi) 
       VALUES ($1, 'topup', $2, $3)`,
      [id_pengguna, jumlah, `Topup via ${metode || "transfer"}`],
    );

    // Update saldo
    await client.query(
      `UPDATE saldo 
       SET saldo = saldo + $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id_pengguna = $2`,
      [jumlah, id_pengguna],
    );

    await client.query("COMMIT");

    const result = await pool.query(
      "SELECT * FROM saldo WHERE id_pengguna = $1",
      [id_pengguna],
    );

    return success(res, result.rows[0], "Topup berhasil");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return error(res, "Server error", 500);
  } finally {
    client.release();
  }
};

// GET history saldo
const getSaldoHistory = async (req, res) => {
  const { id_pengguna } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM saldo_history 
       WHERE id_pengguna = $1 
       ORDER BY created_at DESC`,
      [id_pengguna],
    );
    return success(res, result.rows, "History retrieved");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST kurangi saldo (untuk pembayaran)
const kurangiSaldo = async (req, res) => {
  const { id_pengguna, jumlah, deskripsi } = req.body;

  if (!id_pengguna || !jumlah || jumlah <= 0) {
    return badRequest(res, "Jumlah wajib diisi dan lebih dari 0");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Cek saldo cukup
    const saldoResult = await client.query(
      "SELECT saldo FROM saldo WHERE id_pengguna = $1",
      [id_pengguna],
    );

    if (saldoResult.rows.length === 0 || saldoResult.rows[0].saldo < jumlah) {
      await client.query("ROLLBACK");
      return badRequest(res, "Saldo tidak mencukupi");
    }

    // Insert history
    await client.query(
      `INSERT INTO saldo_history (id_pengguna, jenis, jumlah, deskripsi) 
       VALUES ($1, 'payment', $2, $3)`,
      [id_pengguna, -jumlah, deskripsi || "Pembayaran pesanan"],
    );

    // Update saldo
    await client.query(
      `UPDATE saldo 
       SET saldo = saldo - $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id_pengguna = $2`,
      [jumlah, id_pengguna],
    );

    await client.query("COMMIT");

    const result = await pool.query(
      "SELECT * FROM saldo WHERE id_pengguna = $1",
      [id_pengguna],
    );

    return success(res, result.rows[0], "Saldo berhasil dikurangi");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return error(res, "Server error", 500);
  } finally {
    client.release();
  }
};

module.exports = {
  getSaldo,
  topupSaldo,
  getSaldoHistory,
  kurangiSaldo,
};
