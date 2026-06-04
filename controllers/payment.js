const pool = require("../db/db");
const {
  success,
  error,
  badRequest,
  notFound,
} = require("../middleware/responseFormatter");
const komercePayment = require("../services/komercePayment");

// ========== 1. GET PAYMENT METHODS ==========
const getPaymentMethods = async (req, res) => {
  try {
    const result = await komercePayment.getPaymentMethods();

    if (result.meta && result.meta.code === 200) {
      return success(res, result.data, "Metode pembayaran berhasil diambil");
    } else {
      return error(
        res,
        result.meta?.message || "Gagal mengambil metode pembayaran",
        500,
      );
    }
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// ========== 2. CREATE PAYMENT (VA atau QRIS) ==========
const createPayment = async (req, res) => {
  const {
    order_id,
    payment_type, // 'bank_transfer' atau 'qris'
    channel_code, // untuk VA: 'BCA', 'BNI', 'MANDIRI', dll
    amount,
    customer_name,
    customer_email,
    customer_phone,
    items,
    expiry_duration = 3600,
  } = req.body;

  if (
    !order_id ||
    !payment_type ||
    !amount ||
    !customer_name ||
    !customer_email ||
    !customer_phone
  ) {
    return badRequest(
      res,
      "order_id, payment_type, amount, dan data customer wajib diisi",
    );
  }

  if (payment_type === "bank_transfer" && !channel_code) {
    return badRequest(
      res,
      "Untuk Virtual Account, channel_code wajib diisi (BCA, BNI, MANDIRI, dll)",
    );
  }

  const customer = {
    name: customer_name,
    email: customer_email,
    phone: customer_phone,
  };

  try {
    let result;

    if (payment_type === "qris") {
      result = await komercePayment.createQrisPayment(
        order_id,
        amount,
        customer,
        items,
      );
    } else {
      result = await komercePayment.createVAPayment(
        order_id,
        amount,
        customer,
        items,
        expiry_duration,
      );
    }

    if (result.meta && result.meta.code === 200) {
      // Simpan data pembayaran ke database lokal
      const paymentData = result.data;

      await pool.query(
        `INSERT INTO payments_komerce (
                    payment_id, order_id, payment_type, amount, status, 
                    va_number, qr_string, payment_url, customer_name, customer_email
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          paymentData.id,
          order_id,
          payment_type,
          amount,
          paymentData.status || "PENDING",
          paymentData.va_number || null,
          paymentData.qr_string || null,
          paymentData.payment_url || null,
          customer_name,
          customer_email,
        ],
      );

      return success(
        res,
        {
          payment_id: paymentData.id,
          status: paymentData.status,
          va_number: paymentData.va_number,
          qr_string: paymentData.qr_string,
          payment_url: paymentData.payment_url,
          expired_at: paymentData.expired_at,
        },
        "Transaksi pembayaran berhasil dibuat",
      );
    } else {
      return error(res, result.meta?.message || "Gagal membuat transaksi", 500);
    }
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// ========== 3. CHECK PAYMENT STATUS ==========
const checkPaymentStatus = async (req, res) => {
  const { payment_id } = req.params;

  if (!payment_id) {
    return badRequest(res, "payment_id wajib diisi");
  }

  try {
    const result = await komercePayment.getPaymentStatus(payment_id);

    if (result.meta && result.meta.code === 200) {
      // Update status di database lokal
      const paymentData = result.data;

      await pool.query(
        `UPDATE payments_komerce 
                 SET status = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE payment_id = $2`,
        [paymentData.status, payment_id],
      );

      // Jika status PAID, update status pesanan di tabel pesanan
      if (paymentData.status === "PAID") {
        const paymentRecord = await pool.query(
          "SELECT order_id FROM payments_komerce WHERE payment_id = $1",
          [payment_id],
        );

        if (paymentRecord.rows.length > 0) {
          await pool.query(
            `UPDATE pesanan 
                         SET status_pembayaran = 'sukses', 
                             metode_pembayaran = 'payment_gateway',
                             updated_at = CURRENT_TIMESTAMP 
                         WHERE id_pesanan = $1`,
            [paymentRecord.rows[0].order_id],
          );

          // Buat notifikasi ke user
          await pool.query(
            `INSERT INTO notifikasi (id_pengguna, judul, pesan, tipe) 
                         VALUES ($1, $2, $3, $4)`,
            [
              customer_id,
              "Pembayaran Berhasil",
              `Pembayaran untuk pesanan #${paymentRecord.rows[0].order_id} telah dikonfirmasi.`,
              "pembayaran",
            ],
          );
        }
      }

      return success(
        res,
        {
          payment_id: payment_id,
          status: paymentData.status,
          payment_method: paymentData.payment_method,
          settled_amount: paymentData.settled_amount,
          paid_at: paymentData.paid_at,
        },
        "Status pembayaran berhasil diambil",
      );
    } else {
      return error(res, result.meta?.message || "Gagal mengambil status", 404);
    }
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// ========== 4. CANCEL PAYMENT ==========
const cancelPayment = async (req, res) => {
  const { payment_id } = req.params;
  const { reason } = req.body;

  if (!payment_id) {
    return badRequest(res, "payment_id wajib diisi");
  }

  try {
    const result = await komercePayment.cancelPayment(payment_id, reason);

    if (result.meta && result.meta.code === 200) {
      await pool.query(
        `UPDATE payments_komerce 
                 SET status = 'CANCELED', updated_at = CURRENT_TIMESTAMP 
                 WHERE payment_id = $1`,
        [payment_id],
      );

      return success(res, null, "Pembayaran berhasil dibatalkan");
    } else {
      return error(
        res,
        result.meta?.message || "Gagal membatalkan pembayaran",
        500,
      );
    }
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// ========== 5. WEBHOOK HANDLER (untuk callback dari payment gateway) ==========
const paymentWebhook = async (req, res) => {
  const { payment_id, status, signature } = req.body;

  // Verifikasi signature (opsional, untuk keamanan)
  // Di sini kamu bisa verifikasi signature dengan API key

  try {
    // Update status di database lokal
    await pool.query(
      `UPDATE payments_komerce 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE payment_id = $2`,
      [status, payment_id],
    );

    // Jika status PAID, update status pesanan
    if (status === "PAID") {
      const paymentRecord = await pool.query(
        "SELECT order_id FROM payments_komerce WHERE payment_id = $1",
        [payment_id],
      );

      if (paymentRecord.rows.length > 0) {
        await pool.query(
          `UPDATE pesanan 
                     SET status_pembayaran = 'sukses', 
                         updated_at = CURRENT_TIMESTAMP 
                     WHERE id_pesanan = $1`,
          [paymentRecord.rows[0].order_id],
        );
      }
    }

    return res
      .status(200)
      .json({ status: "success", message: "Webhook diterima" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

module.exports = {
  getPaymentMethods,
  createPayment,
  checkPaymentStatus,
  cancelPayment,
  paymentWebhook,
};
