const pool = require("../db/db");
const {
  success,
  error,
  badRequest,
} = require("../middleware/responseFormatter");
const biteshipService = require("../services/biteship");

// CEK ONGKOS KIRIM (berdasarkan kode pos)
const checkOngkir = async (req, res) => {
  const { origin_postal_code, destination_postal_code, couriers, items } =
    req.body;

  if (!origin_postal_code || !destination_postal_code || !couriers || !items) {
    return badRequest(
      res,
      "origin_postal_code, destination_postal_code, couriers, dan items wajib diisi",
    );
  }

  try {
    // Format payload yang benar untuk Biteship API
    const payload = {
      origin_postal_code: origin_postal_code,
      destination_postal_code: destination_postal_code,
      couriers: couriers,
      items: items,
      origin_contact_name: "Toko BelanjaIn",
      origin_contact_phone: "08123456789",
      destination_contact_name: "Customer",
      destination_contact_phone: "08123456789",
    };

    console.log(
      "Sending payload to Biteship:",
      JSON.stringify(payload, null, 2),
    );

    const result = await biteshipService.cekOngkirByPostalCode(
      origin_postal_code,
      destination_postal_code,
      couriers,
      items,
    );

    console.log("Biteship response:", JSON.stringify(result, null, 2));

    if (result.success) {
      return success(
        res,
        {
          origin: result.origin,
          destination: result.destination,
          pricing: result.pricing,
        },
        "Biaya pengiriman berhasil dihitung",
      );
    } else {
      return error(res, result.error || "Gagal menghitung ongkir", 400);
    }
  } catch (err) {
    console.error("Error detail:", err.response?.data || err.message);
    return error(res, err.response?.data?.error || "Server error", 500);
  }
};

// CEK STATUS RESI (TRACKING)
const checkTracking = async (req, res) => {
  const { tracking_id } = req.params;

  if (!tracking_id) {
    return badRequest(res, "tracking_id wajib diisi");
  }

  try {
    const result = await biteshipService.dapatkanTracking(tracking_id);

    if (result.success) {
      return success(
        res,
        {
          id: result.id,
          waybill_id: result.waybill_id,
          courier: result.courier,
          origin: result.origin,
          destination: result.destination,
          history: result.history,
          status: result.status,
          link: result.link,
        },
        "Status pengiriman berhasil diambil",
      );
    } else {
      return error(
        res,
        result.message || "Gagal mengambil status pengiriman",
        404,
      );
    }
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// CARI AREA (untuk mendapatkan area ID)
const searchArea = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return badRequest(res, "Parameter q wajib diisi");
  }

  try {
    const result = await biteshipService.cariArea(q);

    if (result.success) {
      return success(res, result.data, "Area berhasil ditemukan");
    } else {
      return error(res, result.message || "Gagal mencari area", 404);
    }
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  checkOngkir,
  checkTracking,
  searchArea,
};
