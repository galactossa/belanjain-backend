const axios = require("axios");
require("dotenv").config();

class LayananRajaOngkir {
  constructor() {
    this.kunciApi = process.env.RAJAONGKIR_API_KEY;
    this.urlDasar =
      process.env.RAJAONGKIR_BASE_URL || "https://api.rajaongkir.com/starter";
    this.jenisAkun = process.env.RAJAONGKIR_ACCOUNT_TYPE || "starter";
  }

  // Header untuk permintaan
  dapatkanHeader() {
    return {
      key: this.kunciApi,
      "Content-Type": "application/x-www-form-urlencoded",
    };
  }

  // ========== PROVINSI ==========
  async dapatkanProvinsi() {
    try {
      const response = await axios.get(`${this.urlDasar}/province`, {
        headers: this.dapatkanHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error mendapatkan provinsi:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async dapatkanProvinsiById(idProvinsi) {
    try {
      const response = await axios.get(
        `${this.urlDasar}/province?id=${idProvinsi}`,
        {
          headers: this.dapatkanHeader(),
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error mendapatkan provinsi:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // ========== KOTA ==========
  async dapatkanKota(idProvinsi = null) {
    try {
      let url = `${this.urlDasar}/city`;
      if (idProvinsi) {
        url += `?province=${idProvinsi}`;
      }
      const response = await axios.get(url, {
        headers: this.dapatkanHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error mendapatkan kota:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async dapatkanKotaById(idKota) {
    try {
      const response = await axios.get(`${this.urlDasar}/city?id=${idKota}`, {
        headers: this.dapatkanHeader(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error mendapatkan kota:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // ========== CEK ONGKOS KIRIM ==========
  async dapatkanOngkir(asal, tujuan, berat, kurir) {
    try {
      const params = new URLSearchParams();
      params.append("origin", asal);
      params.append("destination", tujuan);
      params.append("weight", berat);
      params.append("courier", kurir);

      const response = await axios.post(`${this.urlDasar}/cost`, params, {
        headers: {
          ...this.dapatkanHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error mendapatkan ongkir:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // Cek ongkir untuk beberapa kurir sekaligus
  async dapatkanBanyakOngkir(
    asal,
    tujuan,
    berat,
    daftarKurir = ["jne", "pos", "tiki"],
  ) {
    const hasil = {};

    for (const kurir of daftarKurir) {
      try {
        const result = await this.dapatkanOngkir(asal, tujuan, berat, kurir);
        hasil[kurir] = result;
      } catch (error) {
        hasil[kurir] = { error: true, pesan: error.message };
      }
    }

    return hasil;
  }

  // CEK STATUS RESI (Waybill) - KHUSUS PRO
  async dapatkanResi(nomorResi, kurir) {
    if (this.jenisAkun === "starter") {
      console.warn("Pelacakan resi hanya tersedia untuk akun Basic/Pro");
      return {
        error: true,
        pesan: "Pelacakan resi membutuhkan akun Basic atau Pro",
      };
    }

    try {
      const params = new URLSearchParams();
      params.append("waybill", nomorResi);
      params.append("courier", kurir);

      const response = await axios.post(`${this.urlDasar}/waybill`, params, {
        headers: {
          ...this.dapatkanHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error mendapatkan resi:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}

module.exports = new LayananRajaOngkir();
