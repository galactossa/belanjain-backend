const pool = require("../db/db");

// GET laporan by pelapor dengan PAGINATION
const getLaporanByPelapor = async (req, res) => {
  const { id_pelapor } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM laporan WHERE id_pelapor = $1",
      [id_pelapor],
    );
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    const result = await pool.query(
      `
            SELECT * FROM laporan 
            WHERE id_pelapor = $1 
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `,
      [id_pelapor, parseInt(limit), offset],
    );

    res.json({
      data: result.rows,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_data: totalData,
        total_page: totalPage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET semua laporan (admin only) dengan PAGINATION
const getAllLaporan = async (req, res) => {
  const { role, page = 1, limit = 10, status } = req.query;
  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa melihat semua laporan" });
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let query = `
            SELECT l.*, p.nama as pelapor_nama, p.email as pelapor_email
            FROM laporan l
            JOIN pengguna p ON l.id_pelapor = p.id_pengguna
        `;
    let countQuery = "SELECT COUNT(*) FROM laporan";
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` WHERE l.status = $${paramIndex}`;
      countQuery += ` WHERE status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY 
            CASE l.status 
                WHEN 'menunggu' THEN 1 
                WHEN 'diproses' THEN 2 
                ELSE 3 
            END,
            l.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const totalResult = await pool.query(countQuery, status ? [status] : []);
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    const result = await pool.query(query, params);

    res.json({
      data: result.rows,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_data: totalData,
        total_page: totalPage,
        filters: { status },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST buat laporan
const createLaporan = async (req, res) => {
  const { id_pelapor, tipe_target, id_target, alasan } = req.body;

  if (!id_pelapor || !tipe_target || !id_target || !alasan) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  if (tipe_target !== "produk" && tipe_target !== "penjual") {
    return res
      .status(400)
      .json({ message: 'tipe_target harus "produk" atau "penjual"' });
  }

  try {
    const result = await pool.query(
      "INSERT INTO laporan (id_pelapor, tipe_target, id_target, alasan) VALUES ($1, $2, $3, $4) RETURNING *",
      [id_pelapor, tipe_target, id_target, alasan],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT update status laporan (admin only)
const updateStatusLaporan = async (req, res) => {
  const { id } = req.params;
  const { status, catatan_admin } = req.body;
  const { role } = req.query;

  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa mengupdate status laporan" });
  }

  try {
    const result = await pool.query(
      "UPDATE laporan SET status = $1, catatan_admin = $2, updated_at = CURRENT_TIMESTAMP WHERE id_laporan = $3 RETURNING *",
      [status, catatan_admin, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    // Jika status selesai dan tipe_target produk, nonaktifkan produk
    if (status === "selesai" && result.rows[0].tipe_target === "produk") {
      await pool.query("UPDATE produk SET aktif = false WHERE id_produk = $1", [
        result.rows[0].id_target,
      ]);
    }

    // Jika status selesai dan tipe_target penjual, nonaktifkan toko dan user
    if (status === "selesai" && result.rows[0].tipe_target === "penjual") {
      // Dapatkan id_pengguna dari toko
      const toko = await pool.query(
        "SELECT id_pengguna FROM toko WHERE id_toko = $1",
        [result.rows[0].id_target],
      );
      if (toko.rows.length > 0) {
        await pool.query(
          "UPDATE pengguna SET aktif = false WHERE id_pengguna = $1",
          [toko.rows[0].id_pengguna],
        );
      }
      await pool.query("UPDATE toko SET aktif = false WHERE id_toko = $1", [
        result.rows[0].id_target,
      ]);
      await pool.query("UPDATE produk SET aktif = false WHERE id_toko = $1", [
        result.rows[0].id_target,
      ]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getLaporanByPelapor,
  getAllLaporan,
  createLaporan,
  updateStatusLaporan,
};
