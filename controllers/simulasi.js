const pool = require("../db/db");
const {
  success,
  error,
  badRequest,
} = require("../middleware/responseFormatter");

// Fungsi untuk mengambil data historis dari database
const getHistoricalData = async () => {
  // Ambil data pesanan selesai dengan detail waktunya
  const ordersResult = await pool.query(`
    SELECT 
      p.id_pesanan,
      p.created_at as order_created,
      p.updated_at as order_completed,
      p.status,
      EXTRACT(EPOCH FROM (p.updated_at - p.created_at)) / 60 as processing_time_minutes
    FROM pesanan p
    WHERE p.status = 'selesai'
    ORDER BY p.created_at
    LIMIT 1000
  `);

  // Ambil data konfirmasi seller
  const sellerConfirmResult = await pool.query(`
    SELECT 
      p.id_pesanan,
      EXTRACT(EPOCH FROM (p.updated_at - p.created_at)) / 60 as confirm_time
    FROM pesanan p
    WHERE p.status IN ('diproses', 'dikirim', 'selesai')
    AND p.created_at IS NOT NULL
    LIMIT 1000
  `);

  // Ambil data packing (dari tabel item_pesanan)
  const packingResult = await pool.query(`
    SELECT 
      ip.id_pesanan,
      AVG(EXTRACT(EPOCH FROM (ip.created_at - p.created_at)) / 60) as packing_time
    FROM item_pesanan ip
    JOIN pesanan p ON ip.id_pesanan = p.id_pesanan
    WHERE p.status IN ('dikirim', 'selesai')
    GROUP BY ip.id_pesanan
    LIMIT 1000
  `);

  return {
    orders: ordersResult.rows,
    sellerConfirm: sellerConfirmResult.rows,
    packing: packingResult.rows,
  };
};

// Fungsi untuk menghitung statistik dari data historis
const calculateHistoricalStats = (data) => {
  // Hitung rata-rata waktu antar order (inter-arrival time)
  let interArrivalTimes = [];
  for (let i = 1; i < data.orders.length; i++) {
    const timeDiff =
      new Date(data.orders[i].order_created) -
      new Date(data.orders[i - 1].order_created);
    interArrivalTimes.push(timeDiff / (1000 * 60)); // Konversi ke menit
  }

  const avgInterArrivalTime =
    interArrivalTimes.length > 0
      ? interArrivalTimes.reduce((a, b) => a + b, 0) / interArrivalTimes.length
      : 2; // default 2 menit jika tidak ada data

  const arrival_rate_per_hour = 60 / avgInterArrivalTime;

  // Hitung rata-rata waktu proses
  const validOrders = data.orders.filter((o) => o.processing_time_minutes > 0);
  const avgPaymentTime =
    validOrders.length > 0
      ? validOrders.reduce((a, b) => a + b.processing_time_minutes, 0) /
        validOrders.length
      : 2;

  const validConfirm = data.sellerConfirm.filter((c) => c.confirm_time > 0);
  const avgSellerConfirmTime =
    validConfirm.length > 0
      ? validConfirm.reduce((a, b) => a + b.confirm_time, 0) /
        validConfirm.length
      : 3;

  const validPacking = data.packing.filter((p) => p.packing_time > 0);
  const avgPackingTime =
    validPacking.length > 0
      ? validPacking.reduce((a, b) => a + b.packing_time, 0) /
        validPacking.length
      : 2;

  // Hitung jumlah seller aktif dari database
  const getActiveSellers = async () => {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM toko WHERE aktif = true",
    );
    return parseInt(result.rows[0].count);
  };

  return {
    arrival_rate_per_hour: Math.round(arrival_rate_per_hour * 10) / 10,
    avg_payment_time: Math.round(avgPaymentTime * 10) / 10,
    avg_seller_confirm_time: Math.round(avgSellerConfirmTime * 10) / 10,
    avg_packing_time: Math.round(avgPackingTime * 10) / 10,
    sample_size: data.orders.length,
    getActiveSellers,
  };
};

// Fungsi simulasi dengan distribusi berdasarkan data asli
const runSimulationWithRealData = async (minute = 480) => {
  // Ambil data historis
  const historicalData = await getHistoricalData();
  const stats = await calculateHistoricalStats(historicalData);
  const activeSellers = await stats.getActiveSellers();

  // Gunakan statistik dari data asli sebagai parameter simulasi
  const params = {
    arrival_rate: stats.arrival_rate_per_hour,
    avg_payment_time: stats.avg_payment_time,
    avg_seller_confirm_time: stats.avg_seller_confirm_time,
    avg_packing_time: stats.avg_packing_time,
    active_sellers: activeSellers || 5,
    simulation_minutes: minute,
  };

  return runSimulation(params);
};

// Fungsi simulasi dengan parameter (bisa manual atau dari data asli)
const runSimulation = (params) => {
  const {
    arrival_rate = 30, // order per jam (dari data asli)
    avg_payment_time = 2, // menit (dari data asli)
    avg_seller_confirm_time = 3, // menit (dari data asli)
    avg_packing_time = 2, // menit (dari data asli)
    active_sellers = 5, // dari database
    simulation_minutes = 480, // menit
  } = params;

  // Konversi arrival rate ke per menit
  const arrival_rate_per_minute = arrival_rate / 60;

  // === SIMULASI ===
  let currentTime = 0;
  let orderId = 0;
  let completedOrders = 0;
  let totalWaitingTime = 0;

  let queue = [];

  let sellers = [];
  for (let i = 0; i < active_sellers; i++) {
    sellers.push({ id: i + 1, busy: false });
  }

  let events = [];

  // Fungsi untuk mendapatkan random waktu berdasarkan data asli (pakai distribusi eksponensial dengan rata-rata dari data asli)
  const getRandomArrivalGap = () => {
    // Gunakan rata-rata dari data asli
    const mean = 60 / arrival_rate; // rata-rata waktu antar kedatangan (menit)
    return -Math.log(1 - Math.random()) * mean;
  };

  const scheduleArrival = (time) => {
    const gap = getRandomArrivalGap();
    const nextArrivalTime = time + gap;
    if (nextArrivalTime <= simulation_minutes) {
      events.push({ time: nextArrivalTime, type: "arrival" });
    }
  };

  const addOrder = (time) => {
    orderId++;
    queue.push({ id: orderId, createdAt: time });
    paymentQueueLengths.push({ time, length: queue.length });
    processQueue(time);
  };

  let paymentQueueLengths = [];
  let confirmQueueLengths = [];
  let packingQueueLengths = [];

  const processQueue = (time) => {
    if (queue.length === 0) return;

    const availableSeller = sellers.find((s) => !s.busy);
    if (!availableSeller) return;

    const order = queue.shift();
    availableSeller.busy = true;

    const paymentEnd = time + avg_payment_time;
    events.push({
      time: paymentEnd,
      type: "payment_done",
      order: order,
      seller: availableSeller,
    });
  };

  const completePayment = (time, order, seller) => {
    const confirmEnd = time + avg_seller_confirm_time;
    events.push({
      time: confirmEnd,
      type: "confirm_done",
      order: order,
      seller: seller,
    });
  };

  const completeConfirm = (time, order, seller) => {
    const packingEnd = time + avg_packing_time;
    events.push({
      time: packingEnd,
      type: "packing_done",
      order: order,
      seller: seller,
    });
  };

  const completePacking = (time, order, seller) => {
    completedOrders++;
    totalWaitingTime += time - order.createdAt;
    seller.busy = false;
    processQueue(time);
  };

  // Inisialisasi
  events.push({ time: 0, type: "arrival" });

  while (events.length > 0) {
    events.sort((a, b) => a.time - b.time);
    const event = events.shift();
    currentTime = event.time;

    switch (event.type) {
      case "arrival":
        addOrder(currentTime);
        scheduleArrival(currentTime);
        break;
      case "payment_done":
        completePayment(currentTime, event.order, event.seller);
        break;
      case "confirm_done":
        completeConfirm(currentTime, event.order, event.seller);
        break;
      case "packing_done":
        completePacking(currentTime, event.order, event.seller);
        break;
    }
  }

  const avgWaitingTime =
    completedOrders > 0 ? totalWaitingTime / completedOrders : 0;
  const throughput = (completedOrders / simulation_minutes) * 60;
  const avgQueueLength =
    paymentQueueLengths.length > 0
      ? paymentQueueLengths.reduce((a, b) => a + b.length, 0) /
        paymentQueueLengths.length
      : 0;

  const stages = [
    { name: "Pembayaran", duration: avg_payment_time },
    { name: "Konfirmasi Penjual", duration: avg_seller_confirm_time },
    { name: "Packing", duration: avg_packing_time },
  ];
  const bottleneck = stages.reduce(
    (max, stage) => (stage.duration > max.duration ? stage : max),
    stages[0],
  );

  const sellerUtilization =
    ((arrival_rate / 60) * avgWaitingTime) / active_sellers;

  return {
    total_orders_completed: completedOrders,
    simulation_minutes: simulation_minutes,
    throughput_per_hour: Math.round(throughput),
    avg_waiting_time_minutes: Math.round(avgWaitingTime * 10) / 10,
    avg_queue_length: Math.round(avgQueueLength * 10) / 10,
    seller_utilization: Math.round(sellerUtilization * 100),
    bottleneck: bottleneck.name,
    data_source: "data asli dari database",
  };
};

// ENDPOINT: Simulasi dengan data asli
const runRealDataSimulation = async (req, res) => {
  try {
    const { simulation_minutes = 480 } = req.body;

    // Ambil data dari database
    const historicalData = await getHistoricalData();
    const stats = await calculateHistoricalStats(historicalData);
    const activeSellers = await stats.getActiveSellers();

    if (stats.sample_size === 0) {
      return badRequest(
        res,
        "Belum ada data pesanan di database. Silakan jalankan transaksi terlebih dahulu.",
      );
    }

    // Jalankan simulasi dengan parameter dari data asli
    const result = runSimulation({
      arrival_rate: stats.arrival_rate_per_hour,
      avg_payment_time: stats.avg_payment_time,
      avg_seller_confirm_time: stats.avg_seller_confirm_time,
      avg_packing_time: stats.avg_packing_time,
      active_sellers: activeSellers,
      simulation_minutes: simulation_minutes,
    });

    // Tambahkan informasi statistik data asli ke response
    return success(
      res,
      {
        simulasi: result,
        data_historis: {
          total_pesanan_dianalisis: stats.sample_size,
          rata_rata_order_per_jam: stats.arrival_rate_per_hour,
          rata_rata_waktu_pembayaran_menit: stats.avg_payment_time,
          rata_rata_waktu_konfirmasi_seller_menit:
            stats.avg_seller_confirm_time,
          rata_rata_waktu_packing_menit: stats.avg_packing_time,
          jumlah_seller_aktif: activeSellers,
          metode: "Berdasarkan data historis dari database",
        },
      },
      "Simulasi dengan data asli berhasil",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Gagal mengambil data dari database", 500);
  }
};

// ENDPOINT: Simulasi dengan parameter manual
const runManualSimulation = async (req, res) => {
  const {
    arrival_rate,
    payment_duration,
    seller_confirm_duration,
    packing_duration,
    active_sellers,
    simulation_minutes,
  } = req.body;

  if (
    !arrival_rate ||
    !payment_duration ||
    !seller_confirm_duration ||
    !packing_duration ||
    !active_sellers ||
    !simulation_minutes
  ) {
    return badRequest(res, "Semua parameter wajib diisi");
  }

  const result = runSimulation({
    arrival_rate,
    avg_payment_time: payment_duration,
    avg_seller_confirm_time: seller_confirm_duration,
    avg_packing_time: packing_duration,
    active_sellers,
    simulation_minutes,
  });

  return success(
    res,
    {
      simulasi: result,
      parameter_input: {
        order_masuk_per_jam: arrival_rate,
        waktu_pembayaran_menit: payment_duration,
        waktu_konfirmasi_seller_menit: seller_confirm_duration,
        waktu_packing_menit: packing_duration,
        jumlah_seller: active_sellers,
        durasi_simulasi_menit: simulation_minutes,
      },
    },
    "Simulasi dengan parameter manual berhasil",
  );
};

// ENDPOINT: Cek data historis (untuk preview sebelum simulasi)
const getHistoricalPreview = async (req, res) => {
  try {
    const historicalData = await getHistoricalData();
    const stats = await calculateHistoricalStats(historicalData);
    const activeSellers = await stats.getActiveSellers();

    return success(
      res,
      {
        total_data_pesanan: stats.sample_size,
        rata_rata_order_per_jam: stats.arrival_rate_per_hour,
        rata_rata_waktu_pembayaran_menit: stats.avg_payment_time,
        rata_rata_waktu_konfirmasi_seller_menit: stats.avg_seller_confirm_time,
        rata_rata_waktu_packing_menit: stats.avg_packing_time,
        jumlah_seller_aktif: activeSellers,
        catatan:
          "Gunakan data ini untuk simulasi, atau sesuaikan parameter manual",
      },
      "Data historis dari database",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Gagal mengambil data historis", 500);
  }
};

module.exports = {
  runRealDataSimulation,
  runManualSimulation,
  getHistoricalPreview,
};
