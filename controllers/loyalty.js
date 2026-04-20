const pool = require("../db/db");
const {
  success,
  error,
  created,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");

// GET total poin pengguna
const getTotalPoints = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const result = await pool.query(
      "SELECT COALESCE(SUM(poin), 0) as total_points FROM loyalty_points WHERE id_pengguna = $1",
      [id_pengguna],
    );
    return success(
      res,
      {
        id_pengguna: parseInt(id_pengguna),
        total_points: parseInt(result.rows[0].total_points),
      },
      "Total points retrieved",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
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
    return success(res, result.rows, "Point history retrieved");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// POST tambah poin
const addPoints = async (req, res) => {
  const { id_pengguna, poin, sumber, id_referensi, expired_at } = req.body;

  if (!id_pengguna || !poin) {
    return badRequest(res, "id_pengguna dan poin wajib diisi");
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
    return created(res, result.rows[0], "Points added successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// PUT redeem poin
const redeemPoints = async (req, res) => {
  const { id_pengguna, poin_dipakai } = req.body;

  if (!id_pengguna || !poin_dipakai) {
    return badRequest(res, "id_pengguna dan poin_dipakai wajib diisi");
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
      return badRequest(res, "Poin tidak mencukupi");
    }

    await client.query(
      "INSERT INTO loyalty_points (id_pengguna, poin, sumber) VALUES ($1, $2, $3)",
      [id_pengguna, -poin_dipakai, "redeem"],
    );

    await client.query("COMMIT");
    return success(
      res,
      { poin_digunakan: poin_dipakai },
      "Points redeemed successfully",
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return error(res, "Server error", 500);
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

    return success(
      res,
      {
        id_pengguna: parseInt(id_pengguna),
        total_points: totalPoin,
        membership_level: level,
        badge: badge,
        min_points_for_current_level: minPoints,
        points_to_next_level: nextLevelPoints
          ? nextLevelPoints - totalPoin
          : null,
        next_level_name: nextLevelName,
      },
      "Membership level retrieved",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getTotalPoints,
  getPointHistory,
  addPoints,
  redeemPoints,
  getMembershipLevel,
};
