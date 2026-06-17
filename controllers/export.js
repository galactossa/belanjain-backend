const pool = require("../db/db");
const {
  success,
  error,
  badRequest,
} = require("../middleware/responseFormatter");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

// Helper: format tanggal Indonesia
const formatTanggal = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Helper: format rupiah
const formatRupiah = (angka) => {
  if (!angka) return "Rp0";
  return "Rp" + parseInt(angka).toLocaleString("id-ID");
};

// 1. EXPORT LAPORAN PENJUALAN (EXCEL)
const exportPenjualanExcel = async (req, res) => {
  const { start_date, end_date, seller_id, status } = req.query;

  try {
    let query = `
            SELECT 
                p.id_pesanan,
                p.tanggal_pesanan,
                p.status,
                p.total_harga,
                p.potongan_diskon,
                p.harga_akhir,
                p.metode_pembayaran,
                p.status_pembayaran,
                u.nama as pembeli_nama,
                u.email as pembeli_email,
                t.nama_toko as toko_nama,
                COALESCE((
                    SELECT COUNT(*) FROM item_pesanan ip 
                    WHERE ip.id_pesanan = p.id_pesanan
                ), 0) as jumlah_item
            FROM pesanan p
            JOIN pengguna u ON p.id_pengguna = u.id_pengguna
            LEFT JOIN toko t ON u.id_pengguna = t.id_pengguna
            WHERE 1=1
        `;
    const params = [];
    let paramIndex = 1;

    if (start_date) {
      query += ` AND p.tanggal_pesanan >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND p.tanggal_pesanan <= $${paramIndex++}`;
      params.push(end_date + " 23:59:59");
    }
    if (seller_id) {
      query += ` AND t.id_toko = $${paramIndex++}`;
      params.push(seller_id);
    }
    if (status) {
      query += ` AND p.status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY p.tanggal_pesanan DESC`;

    const result = await pool.query(query, params);
    const data = result.rows;

    if (data.length === 0) {
      return badRequest(
        res,
        "Tidak ada data penjualan untuk periode yang dipilih",
      );
    }

    const totalPesanan = data.length;
    const totalPendapatan = data.reduce(
      (sum, row) => sum + parseFloat(row.harga_akhir),
      0,
    );
    const totalDiskon = data.reduce(
      (sum, row) => sum + parseFloat(row.potongan_diskon),
      0,
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "BelanjaIn";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Laporan Penjualan");

    worksheet.columns = [
      { header: "ID Pesanan", key: "id_pesanan", width: 12 },
      { header: "Tanggal", key: "tanggal_pesanan", width: 20 },
      { header: "Pembeli", key: "pembeli_nama", width: 25 },
      { header: "Email Pembeli", key: "pembeli_email", width: 30 },
      { header: "Toko", key: "toko_nama", width: 25 },
      { header: "Jumlah Item", key: "jumlah_item", width: 12 },
      { header: "Total Harga", key: "total_harga", width: 15 },
      { header: "Diskon", key: "potongan_diskon", width: 15 },
      { header: "Harga Akhir", key: "harga_akhir", width: 15 },
      { header: "Status Pesanan", key: "status", width: 15 },
      { header: "Metode Bayar", key: "metode_pembayaran", width: 15 },
      { header: "Status Bayar", key: "status_pembayaran", width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2E7D32" },
    };
    worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    data.forEach((row) => {
      worksheet.addRow({
        id_pesanan: row.id_pesanan,
        tanggal_pesanan: formatTanggal(row.tanggal_pesanan),
        pembeli_nama: row.pembeli_nama || "-",
        pembeli_email: row.pembeli_email || "-",
        toko_nama: row.toko_nama || "-",
        jumlah_item: row.jumlah_item,
        total_harga: formatRupiah(row.total_harga),
        potongan_diskon: formatRupiah(row.potongan_diskon),
        harga_akhir: formatRupiah(row.harga_akhir),
        status: row.status,
        metode_pembayaran: row.metode_pembayaran || "-",
        status_pembayaran: row.status_pembayaran,
      });
    });

    worksheet.addRow({});
    worksheet.addRow({ id_pesanan: "RINGKASAN" });
    worksheet.addRow({
      id_pesanan: "Total Pesanan:",
      total_harga: totalPesanan,
    });
    worksheet.addRow({
      id_pesanan: "Total Pendapatan:",
      total_harga: formatRupiah(totalPendapatan),
    });
    worksheet.addRow({
      id_pesanan: "Total Diskon:",
      total_harga: formatRupiah(totalDiskon),
    });

    const summarySheet = workbook.addWorksheet("Ringkasan per Status");
    summarySheet.columns = [
      { header: "Status Pesanan", key: "status", width: 20 },
      { header: "Jumlah", key: "jumlah", width: 15 },
      { header: "Total Pendapatan", key: "total", width: 20 },
    ];

    summarySheet.getRow(1).font = { bold: true };

    const statusGroups = {};
    data.forEach((row) => {
      if (!statusGroups[row.status]) {
        statusGroups[row.status] = { jumlah: 0, total: 0 };
      }
      statusGroups[row.status].jumlah++;
      statusGroups[row.status].total += parseFloat(row.harga_akhir);
    });

    Object.keys(statusGroups).forEach((status) => {
      summarySheet.addRow({
        status: status,
        jumlah: statusGroups[status].jumlah,
        total: formatRupiah(statusGroups[status].total),
      });
    });

    const filename = `laporan_penjualan_${Date.now()}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// 2. EXPORT LAPORAN PENJUALAN (PDF)
const exportPenjualanPdf = async (req, res) => {
  const { start_date, end_date, seller_id, status } = req.query;

  try {
    let query = `
            SELECT 
                p.id_pesanan,
                p.tanggal_pesanan,
                p.status,
                p.total_harga,
                p.potongan_diskon,
                p.harga_akhir,
                p.metode_pembayaran,
                p.status_pembayaran,
                u.nama as pembeli_nama,
                u.email as pembeli_email,
                t.nama_toko as toko_nama,
                COALESCE((
                    SELECT COUNT(*) FROM item_pesanan ip 
                    WHERE ip.id_pesanan = p.id_pesanan
                ), 0) as jumlah_item
            FROM pesanan p
            JOIN pengguna u ON p.id_pengguna = u.id_pengguna
            LEFT JOIN toko t ON u.id_pengguna = t.id_pengguna
            WHERE 1=1
        `;
    const params = [];
    let paramIndex = 1;

    if (start_date) {
      query += ` AND p.tanggal_pesanan >= $${paramIndex++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND p.tanggal_pesanan <= $${paramIndex++}`;
      params.push(end_date + " 23:59:59");
    }
    if (seller_id) {
      query += ` AND t.id_toko = $${paramIndex++}`;
      params.push(seller_id);
    }
    if (status) {
      query += ` AND p.status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY p.tanggal_pesanan DESC`;

    const result = await pool.query(query, params);
    const data = result.rows;

    if (data.length === 0) {
      return badRequest(
        res,
        "Tidak ada data penjualan untuk periode yang dipilih",
      );
    }

    const totalPesanan = data.length;
    const totalPendapatan = data.reduce(
      (sum, row) => sum + parseFloat(row.harga_akhir),
      0,
    );
    const totalDiskon = data.reduce(
      (sum, row) => sum + parseFloat(row.potongan_diskon),
      0,
    );
    const rataRataPesanan = totalPendapatan / totalPesanan;

    // Buat PDF
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      layout: "landscape",
    });

    const filename = `laporan_penjualan_${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    doc.pipe(res);

    // Header
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#2E7D32")
      .text("LAPORAN PENJUALAN BELANJAIN", { align: "center" });

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666666")
      .text(`Periode: ${start_date || "Semua"} - ${end_date || "Semua"}`, {
        align: "center",
      });

    doc.moveDown();

    // Ringkasan
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("RINGKASAN", { underline: true });

    doc.moveDown(0.5);

    const startX = 50;
    let y = doc.y;

    doc.fontSize(10).font("Helvetica");
    doc.text("Total Pesanan:", startX, y);
    doc.text(totalPesanan.toString(), startX + 120, y);

    doc.text("Total Pendapatan:", startX + 250, y);
    doc.text(formatRupiah(totalPendapatan), startX + 370, y);

    y += 20;
    doc.text("Total Diskon:", startX, y);
    doc.text(formatRupiah(totalDiskon), startX + 120, y);

    doc.text("Rata-rata per Pesanan:", startX + 250, y);
    doc.text(formatRupiah(rataRataPesanan), startX + 370, y);

    y += 20;
    doc.text("Jumlah Item Terjual:", startX, y);
    doc.text(
      data.reduce((sum, row) => sum + row.jumlah_item, 0).toString(),
      startX + 120,
      y,
    );

    doc.moveDown();

    // Tabel Detail Pesanan
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("DETAIL PESANAN", { underline: true });
    doc.moveDown(0.5);

    // Header tabel
    const tableTop = doc.y;
    const colPositions = [50, 90, 140, 220, 290, 350, 410, 480, 550, 620, 690];

    doc.fontSize(8).font("Helvetica-Bold");
    doc.text("ID", colPositions[0], tableTop);
    doc.text("Tanggal", colPositions[1], tableTop);
    doc.text("Pembeli", colPositions[2], tableTop);
    doc.text("Item", colPositions[5], tableTop);
    doc.text("Total", colPositions[6], tableTop);
    doc.text("Diskon", colPositions[7], tableTop);
    doc.text("Akhir", colPositions[8], tableTop);
    doc.text("Status", colPositions[9], tableTop);

    doc.moveDown();
    doc
      .strokeColor("#CCCCCC")
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(750, doc.y)
      .stroke();

    let rowY = doc.y;
    doc.fontSize(7).font("Helvetica");

    const maxRows = 25;
    const rowsToShow = data.slice(0, maxRows);

    rowsToShow.forEach((row) => {
      if (rowY > 500) {
        doc.addPage();
        rowY = 50;
        // Ulang header
        doc.fontSize(8).font("Helvetica-Bold");
        doc.text("ID", colPositions[0], rowY);
        doc.text("Tanggal", colPositions[1], rowY);
        doc.text("Pembeli", colPositions[2], rowY);
        doc.text("Item", colPositions[5], rowY);
        doc.text("Total", colPositions[6], rowY);
        doc.text("Diskon", colPositions[7], rowY);
        doc.text("Akhir", colPositions[8], rowY);
        doc.text("Status", colPositions[9], rowY);
        rowY += 15;
        doc.fontSize(7).font("Helvetica");
      }

      doc.text(row.id_pesanan.toString(), colPositions[0], rowY);
      doc.text(formatTanggal(row.tanggal_pesanan), colPositions[1], rowY);
      doc.text(
        (row.pembeli_nama || "-").substring(0, 15),
        colPositions[2],
        rowY,
      );
      doc.text(row.jumlah_item.toString(), colPositions[5], rowY);
      doc.text(formatRupiah(row.total_harga), colPositions[6], rowY);
      doc.text(formatRupiah(row.potongan_diskon), colPositions[7], rowY);
      doc.text(formatRupiah(row.harga_akhir), colPositions[8], rowY);
      doc.text(row.status, colPositions[9], rowY);

      rowY += 15;
    });

    if (data.length > maxRows) {
      doc.text(`... dan ${data.length - maxRows} pesanan lainnya`, 50, rowY);
    }

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#999999")
      .text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, {
        align: "right",
      });
    doc.text("© 2026 BelanjaIn - Platform E-Commerce Terpercaya", {
      align: "center",
    });

    doc.end();
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// 3. EXPORT LAPORAN PER PRODUK (EXCEL)
const exportProdukTerlarisExcel = async (req, res) => {
  const { limit = 50 } = req.query;

  try {
    const result = await pool.query(
      `
            SELECT 
                p.id_produk,
                p.nama_produk,
                k.nama_kategori,
                t.nama_toko,
                p.harga,
                p.total_terjual,
                p.rata_rating,
                COALESCE(SUM(ip.jumlah), 0) as total_terjual_periode
            FROM produk p
            LEFT JOIN kategori k ON p.id_kategori = k.id_kategori
            LEFT JOIN toko t ON p.id_toko = t.id_toko
            LEFT JOIN item_pesanan ip ON p.id_produk = ip.id_produk
            LEFT JOIN pesanan ps ON ip.id_pesanan = ps.id_pesanan AND ps.status = 'selesai'
            WHERE p.aktif = true
            GROUP BY p.id_produk, k.nama_kategori, t.nama_toko
            ORDER BY total_terjual_periode DESC
            LIMIT $1
        `,
      [parseInt(limit)],
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "BelanjaIn";

    const worksheet = workbook.addWorksheet("Produk Terlaris");

    worksheet.columns = [
      { header: "ID", key: "id_produk", width: 8 },
      { header: "Nama Produk", key: "nama_produk", width: 40 },
      { header: "Kategori", key: "nama_kategori", width: 20 },
      { header: "Toko", key: "nama_toko", width: 25 },
      { header: "Harga", key: "harga", width: 15 },
      { header: "Total Terjual", key: "total_terjual_periode", width: 15 },
      { header: "Rating", key: "rata_rating", width: 10 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2E7D32" },
    };
    worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    result.rows.forEach((row) => {
      worksheet.addRow({
        id_produk: row.id_produk,
        nama_produk: row.nama_produk,
        nama_kategori: row.nama_kategori || "-",
        nama_toko: row.nama_toko || "-",
        harga: formatRupiah(row.harga),
        total_terjual_periode: parseInt(row.total_terjual_periode),
        rata_rating: row.rata_rating || 0,
      });
    });

    const filename = `produk_terlaris_${Date.now()}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  exportPenjualanExcel,
  exportPenjualanPdf,
  exportProdukTerlarisExcel,
};
