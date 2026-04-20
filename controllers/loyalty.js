const pool = require("../db/db");

// GET total poin pengguna
const getTotalPoints = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      "SELECT COALESCE(SUM(poin), 0) as total_points FROM loyalty_points WHERE id_pengguna = $1",
      [id_pengguna],
    );
    res.json({
      id_pengguna: parseInt(id_pengguna),
      total_points: parseInt(result.rows[0].total_points),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET riwayat poin
const getPointHistory = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM loyalty_points WHERE id_pengguna = $1 ORDER BY created_at DESC",
      [id_pengguna],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST tambah poin (dipanggil saat checkout selesai)
const addPoints = async (req, res) => {
  const { id_pengguna, poin, sumber, id_referensi, expired_at } = req.body;

  if (!id_pengguna || !poin) {
    return res
      .status(400)
      .json({ message: "id_pengguna dan poin wajib diisi" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO loyalty_points (id_pengguna, poin, sumber, id_referensi, expired_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        id_pengguna,
        poin,
        sumber || "pembelian",
        id_referensi || null,
        expired_at || null,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT redeem poin (tukar poin dengan voucher)
const redeemPoints = async (req, res) => {
  const { id_pengguna, poin_dipakai } = req.body;

  if (!id_pengguna || !poin_dipakai) {
    return res
      .status(400)
      .json({ message: "id_pengguna dan poin_dipakai wajib diisi" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const totalResult = await client.query(
      "SELECT COALESCE(SUM(poin), 0) as total FROM loyalty_points WHERE id_pengguna = $1",
      [id_pengguna],
    );
    const totalPoin = parseInt(totalResult.rows[0].total);

    if (totalPoin < poin_dipakai) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Poin tidak mencukupi" });
    }

    await client.query(
      "INSERT INTO loyalty_points (id_pengguna, poin, sumber) VALUES ($1, $2, $3)",
      [id_pengguna, -poin_dipakai, "redeem"],
    );

    await client.query("COMMIT");
    res.json({
      message: "Poin berhasil ditukar",
      poin_digunakan: poin_dipakai,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// GET membership level
const getMembershipLevel = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      "SELECT COALESCE(SUM(poin), 0) as total FROM loyalty_points WHERE id_pengguna = $1",
      [id_pengguna],
    );
    const totalPoin = parseInt(result.rows[0].total);

    let level = "Regular";
    let badge = "🟢";
    let minPoints = 0;
    let nextLevelPoints = 500;
    let nextLevelName = "Gold";

    if (totalPoin >= 1000) {
      level = "Platinum";
      badge = "💎";
      minPoints = 1000;
      nextLevelPoints = null;
      nextLevelName = null;
    } else if (totalPoin >= 500) {
      level = "Gold";
      badge = "🥇";
      minPoints = 500;
      nextLevelPoints = 1000;
      nextLevelName = "Platinum";
    }

    res.json({
      id_pengguna: parseInt(id_pengguna),
      total_points: totalPoin,
      membership_level: level,
      badge: badge,
      min_points_for_current_level: minPoints,
      points_to_next_level: nextLevelPoints
        ? nextLevelPoints - totalPoin
        : null,
      next_level_name: nextLevelName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTotalPoints,
  getPointHistory,
  addPoints,
  redeemPoints,
  getMembershipLevel,
};
