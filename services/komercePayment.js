const axios = require("axios");
require("dotenv").config();

class KomercePaymentService {
  constructor() {
    this.apiKey = process.env.KOMERCE_API_KEY;
    this.baseUrl =
      process.env.KOMERCE_BASE_URL ||
      "https://api-sandbox.collaborator.komerce.id";
    this.paymentUrl =
      process.env.KOMERCE_PAYMENT_URL || "https://pay-sandbox.komerce.id";
  }

  _validateApiKey() {
    if (!this.apiKey || this.apiKey === "") {
      console.warn("⚠️ KOMERCE_API_KEY tidak ditemukan");
      return false;
    }
    return true;
  }

  getHeaders() {
    return {
      "x-api-key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  // ========== 1. GET PAYMENT METHODS ==========
  async getPaymentMethods() {
    if (!this._validateApiKey()) {
      console.log("⚠️ Komerce API Key missing, using fallback methods");
      return {
        meta: { code: 200 },
        data: [
          {
            id: "bca_va",
            name: "BCA Virtual Account",
            type: "bank_transfer",
            channel_code: "BCA",
          },
          {
            id: "mandiri_va",
            name: "Mandiri Virtual Account",
            type: "bank_transfer",
            channel_code: "MANDIRI",
          },
          {
            id: "bni_va",
            name: "BNI Virtual Account",
            type: "bank_transfer",
            channel_code: "BNI",
          },
          { id: "qris", name: "QRIS", type: "qris", channel_code: "QRIS" },
        ],
      };
    }

    try {
      console.log("📡 Fetching payment methods from Komerce...");
      const response = await axios.get(`${this.baseUrl}/api/v1/user/methods`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      console.log("✅ Komerce response received");
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error getting payment methods:",
        error.response?.data || error.message,
      );
      return {
        meta: { code: 200 },
        data: [
          {
            id: "bca_va",
            name: "BCA Virtual Account",
            type: "bank_transfer",
            channel_code: "BCA",
          },
          {
            id: "mandiri_va",
            name: "Mandiri Virtual Account",
            type: "bank_transfer",
            channel_code: "MANDIRI",
          },
          {
            id: "bni_va",
            name: "BNI Virtual Account",
            type: "bank_transfer",
            channel_code: "BNI",
          },
          { id: "qris", name: "QRIS", type: "qris", channel_code: "QRIS" },
        ],
      };
    }
  }

  // ========== 2. CREATE VA PAYMENT ==========
  async createVAPayment(
    orderId,
    amount,
    customer,
    items,
    expiryDuration = 3600,
    callbackUrl = null,
    callbackApiKey = null,
  ) {
    if (!this._validateApiKey()) {
      return {
        meta: { code: 503, message: "Payment service unavailable" },
        data: null,
      };
    }

    try {
      const formattedItems = items.map((item) => ({
        name: String(item.name || "Produk"),
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      }));

      // 🔥 COBA dengan format yang berbeda
      const payload = {
        order_id: String(orderId),
        payment_type: "bank_transfer",
        bank_code: String(channel_code || "BCA"), // Coba bank_code lagi
        amount: Number(amount),
        customer_detail: {
          // ← Coba customer_detail bukan customer
          name: String(customer.name),
          email: String(customer.email),
          phone: String(customer.phone),
        },
        items: formattedItems,
        expiry: Number(expiryDuration) || 3600, // ← Coba expiry bukan expiry_duration
      };

      console.log(
        "📡 Sending VA payment payload:",
        JSON.stringify(payload, null, 2),
      );

      const response = await axios.post(
        `${this.baseUrl}/api/v1/payment/create`, // ← Coba endpoint yang berbeda
        payload,
        {
          headers: this.getHeaders(),
          timeout: 30000,
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error creating VA payment:",
        error.response?.data || error.message,
      );
      console.error("❌ Status:", error.response?.status);
      console.error(
        "❌ Full error:",
        JSON.stringify(error.response?.data, null, 2),
      );
      return {
        meta: {
          code: error.response?.status || 503,
          message:
            error.response?.data?.message ||
            error.response?.data?.meta?.message ||
            "Payment service unavailable",
        },
        data: null,
      };
    }
  }

  // ========== 3. CREATE QRIS PAYMENT ==========
  async createQrisPayment(
    orderId,
    amount,
    customer,
    items,
    callbackUrl = null,
    callbackApiKey = null,
  ) {
    if (!this._validateApiKey()) {
      return {
        meta: { code: 503, message: "Payment service unavailable" },
        data: null,
      };
    }

    try {
      const formattedItems = items.map((item) => ({
        name: String(item.name || "Produk"),
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      }));

      const payload = {
        order_id: String(orderId),
        payment_type: "qris",
        amount: Number(amount),
        customer_detail: {
          name: String(customer.name),
          email: String(customer.email),
          phone: String(customer.phone),
        },
        items: formattedItems,
      };

      console.log(
        "📡 Sending QRIS payment payload:",
        JSON.stringify(payload, null, 2),
      );

      const response = await axios.post(
        `${this.baseUrl}/api/v1/payment/create`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: 30000,
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error creating QRIS payment:",
        error.response?.data || error.message,
      );
      console.error("❌ Status:", error.response?.status);
      return {
        meta: {
          code: error.response?.status || 503,
          message:
            error.response?.data?.message ||
            error.response?.data?.meta?.message ||
            "Payment service unavailable",
        },
        data: null,
      };
    }
  }

  // ========== 4. CHECK PAYMENT STATUS ==========
  async getPaymentStatus(paymentId) {
    if (!this._validateApiKey()) {
      return {
        meta: { code: 404, message: "Payment status unavailable" },
        data: null,
      };
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/payment/status/${paymentId}`,
        {
          headers: this.getHeaders(),
          timeout: 10000,
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error getting payment status:",
        error.response?.data || error.message,
      );
      return {
        meta: { code: 404, message: "Payment status unavailable" },
        data: null,
      };
    }
  }

  // ========== 5. CANCEL PAYMENT ==========
  async cancelPayment(paymentId, reason) {
    if (!this._validateApiKey()) {
      return {
        meta: { code: 500, message: "Failed to cancel payment" },
        data: null,
      };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/payment/cancel`,
        {
          payment_id: paymentId,
          reason: reason || "Order dibatalkan oleh customer",
        },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error canceling payment:",
        error.response?.data || error.message,
      );
      return {
        meta: { code: 500, message: "Failed to cancel payment" },
        data: null,
      };
    }
  }
}

module.exports = new KomercePaymentService();
