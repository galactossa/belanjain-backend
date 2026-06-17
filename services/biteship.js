const axios = require("axios");
require("dotenv").config();

class LayananBiteship {
  constructor() {
    this.apiKey = process.env.BITESHIP_API_KEY;
    this.baseUrl =
      process.env.BITESHIP_BASE_URL || "https://api.biteship.com/v1";
  }

  // Header untuk request ke Biteship
  dapatkanHeader() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  // CEK ONGKOS KIRIM (berdasarkan kode pos)
  async cekOngkirByPostalCode(
    originPostalCode,
    destinationPostalCode,
    couriers,
    items,
  ) {
    try {
      const payload = {
        origin_postal_code: originPostalCode,
        destination_postal_code: destinationPostalCode,
        couriers: couriers,
        items: items,
        origin_contact_name: "Toko BelanjaIn",
        origin_contact_phone: "08123456789",
        destination_contact_name: "Customer",
        destination_contact_phone: "08123456789",
      };

      const response = await axios.post(
        `${this.baseUrl}/rates/couriers`,
        payload,
        { headers: this.dapatkanHeader() },
      );

      return response.data;
    } catch (error) {
      console.error("Error cek ongkir:", error.response?.data || error.message);
      throw error;
    }
  }

  async cekOngkirByCoordinate(
    originLat,
    originLng,
    destLat,
    destLng,
    couriers,
    items,
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/rates/couriers`,
        {
          origin_latitude: originLat,
          origin_longitude: originLng,
          destination_latitude: destLat,
          destination_longitude: destLng,
          couriers: couriers,
          items: items,
        },
        { headers: this.dapatkanHeader() },
      );
      return response.data;
    } catch (error) {
      console.error("Error cek ongkir:", error.response?.data || error.message);
      throw error;
    }
  }

  // CEK STATUS RESI (TRACKING)
  async dapatkanTracking(trackingId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/trackings/${trackingId}`,
        { headers: this.dapatkanHeader() },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error mendapatkan tracking:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // CARI AREA
  async cariArea(input) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/maps/areas?input=${encodeURIComponent(input)}`,
        { headers: this.dapatkanHeader() },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error mencari area:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}

module.exports = new LayananBiteship();
