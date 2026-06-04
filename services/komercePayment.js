const axios = require("axios");
require("dotenv").config();

class KomercePaymentService {
  constructor() {
    this.apiKey = process.env.KOMERCE_API_KEY;
    this.baseUrl =
      process.env.KOMERCE_BASE_URL ||
      "https://api-sandbox.collaborator.komerce.id/user";
    this.paymentUrl =
      process.env.KOMERCE_PAYMENT_URL || "https://pay-sandbox.komerce.id";
  }

  getHeaders() {
    return {
      "x-api-key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  // ========== 1. GET PAYMENT METHODS ==========
  async getPaymentMethods() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/user/methods`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error getting payment methods:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // ========== 2. CREATE PAYMENT (VIRTUAL ACCOUNT) ==========
  async createVAPayment(
    orderId,
    amount,
    customer,
    items,
    expiryDuration = 3600,
    callbackUrl = null,
    callbackApiKey = null,
  ) {
    try {
      const payload = {
        order_id: orderId,
        payment_type: "bank_transfer",
        channel_code: "BCA", // Bisa diganti sesuai bank yang dipilih
        amount: amount,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        expiry_duration: expiryDuration,
      };

      if (callbackUrl && callbackApiKey) {
        payload.callback_url = callbackUrl;
        payload.callback_API_KEY = callbackApiKey;
      }

      const response = await axios.post(
        `${this.baseUrl}/api/v1/user/payment/create`,
        payload,
        {
          headers: this.getHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating VA payment:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // ========== 3. CREATE PAYMENT (QRIS) ==========
  async createQrisPayment(
    orderId,
    amount,
    customer,
    items,
    callbackUrl = null,
    callbackApiKey = null,
  ) {
    try {
      const payload = {
        order_id: orderId,
        payment_type: "qris",
        amount: amount,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      if (callbackUrl && callbackApiKey) {
        payload.callback_url = callbackUrl;
        payload.callback_API_KEY = callbackApiKey;
      }

      const response = await axios.post(
        `${this.baseUrl}/api/v1/user/payment/create`,
        payload,
        {
          headers: this.getHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error creating QRIS payment:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // ========== 4. CHECK PAYMENT STATUS ==========
  async getPaymentStatus(paymentId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/user/payment/status/${paymentId}`,
        {
          headers: this.getHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error getting payment status:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // ========== 5. CANCEL PAYMENT ==========
  async cancelPayment(paymentId, reason) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/user/payment/cancel`,
        {
          payment_id: paymentId,
          reason: reason || "Order dibatalkan oleh customer",
        },
        {
          headers: this.getHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error canceling payment:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}

module.exports = new KomercePaymentService();
