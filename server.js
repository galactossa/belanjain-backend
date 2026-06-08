const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

// Debug environment (hapus nanti setelah berhasil)
console.log("🔍 ENVIRONMENT CHECK:");
console.log(
  "   GOOGLE_CLIENT_ID:",
  process.env.GOOGLE_CLIENT_ID ? "✅ EXISTS" : "❌ MISSING",
);
console.log(
  "   GOOGLE_CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET ? "✅ EXISTS" : "❌ MISSING",
);
console.log("   DB_HOST:", process.env.DB_HOST ? "✅ EXISTS" : "❌ MISSING");
console.log(
  "   DATABASE_URL:",
  process.env.DATABASE_URL ? "✅ EXISTS" : "❌ MISSING",
);
console.log("   PORT:", process.env.PORT || "3000");

require("./config/passport");

const app = express();
const port = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
// CORS dengan credentials untuk session
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration (untuk Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia_session_default",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 jam
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
    },
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files dari folder uploads
app.use("/uploads", express.static("uploads"));

// ========== IMPORT ROUTES ==========
const penggunaRoutes = require("./routes/pengguna");
const alamatRoutes = require("./routes/alamat");
const tokoRoutes = require("./routes/toko");
const kategoriRoutes = require("./routes/kategori");
const produkRoutes = require("./routes/produk");
const wishlistRoutes = require("./routes/wishlist");
const keranjangRoutes = require("./routes/keranjang");
const voucherRoutes = require("./routes/voucher");
const pesananRoutes = require("./routes/pesanan");
const ulasanRoutes = require("./routes/ulasan");
const notifikasiRoutes = require("./routes/notifikasi");
const laporanRoutes = require("./routes/laporan");
const transaksiRoutes = require("./routes/transaksi");
const statistikRoutes = require("./routes/statistik");
const trustScoreRoutes = require("./routes/trustScore");
const adminRoutes = require("./routes/admin");
const settingsRoutes = require("./routes/settings");
const blogRoutes = require("./routes/blog");
const searchHistoryRoutes = require("./routes/searchHistory");
const loyaltyRoutes = require("./routes/loyalty");
const rekomendasiRoutes = require("./routes/rekomendasi");
const simulasiRoutes = require("./routes/simulasi");
const chatRoutes = require("./routes/chat");
const exportRoutes = require("./routes/export");
const ongkirRoutes = require("./routes/ongkir");
const paymentRoutes = require("./routes/payment");
const authRoutes = require("./routes/auth");

// ========== USE ROUTES ==========
app.use("/api/pengguna", penggunaRoutes);
app.use("/api/alamat", alamatRoutes);
app.use("/api/toko", tokoRoutes);
app.use("/api/kategori", kategoriRoutes);
app.use("/api/produk", produkRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/keranjang", keranjangRoutes);
app.use("/api/voucher", voucherRoutes);
app.use("/api/pesanan", pesananRoutes);
app.use("/api/ulasan", ulasanRoutes);
app.use("/api/notifikasi", notifikasiRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/transaksi", transaksiRoutes);
app.use("/api/statistik", statistikRoutes);
app.use("/api/trust-score", trustScoreRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/search-history", searchHistoryRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/rekomendasi", rekomendasiRoutes);
app.use("/api/simulasi", simulasiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/ongkir", ongkirRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);

// ========== TEST ROUTE ==========
app.get("/", (req, res) => {
  res.json({
    message: "API BelanjaIn is running!",
    endpoints: {
      pengguna: "/api/pengguna",
      alamat: "/api/alamat",
      toko: "/api/toko",
      kategori: "/api/kategori",
      produk: "/api/produk",
      wishlist: "/api/wishlist",
      keranjang: "/api/keranjang",
      voucher: "/api/voucher",
      pesanan: "/api/pesanan",
      ulasan: "/api/ulasan",
      notifikasi: "/api/notifikasi",
      laporan: "/api/laporan",
      transaksi: "/api/transaksi",
      statistik: "/api/statistik",
      trustScore: "/api/trust-score",
      admin: "/api/admin",
      settings: "/api/settings",
      blogs: "/api/blogs",
      searchHistory: "/api/search-history",
      loyalty: "/api/loyalty",
      rekomendasi: "/api/rekomendasi",
      simulasi: "/api/simulasi",
      chat: "/api/chat",
      export: "/api/export",
      ongkir: "/api/ongkir",
      payment: "/api/payment",
      auth: "/api/auth",
    },
  });
});

// ========== SOCKET.IO CHAT SYSTEM ==========
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const pool = require("./db/db");

// Store online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User login ke chat (set user info)
  socket.on("user-online", async (data) => {
    const { user_id, role, name } = data;
    socket.userId = user_id;
    socket.userRole = role;
    socket.userName = name;

    onlineUsers.set(user_id, {
      socketId: socket.id,
      role: role,
      name: name,
    });

    console.log(`User ${name} (${role}) is online`);

    // Broadcast online users ke semua
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  // Kirim pesan
  socket.on("send-message", async (data) => {
    const { receiver_id, message, sender_id, sender_name, sender_role } = data;

    try {
      // Simpan pesan ke database
      const result = await pool.query(
        `INSERT INTO chat_messages (sender_id, receiver_id, message, is_read, created_at) 
                 VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
                 RETURNING id, sender_id, receiver_id, message, is_read, created_at`,
        [sender_id, receiver_id, message, false],
      );

      const newMessage = result.rows[0];
      newMessage.sender_name = sender_name;
      newMessage.sender_role = sender_role;

      // Kirim ke receiver jika online
      const receiver = onlineUsers.get(receiver_id);
      if (receiver) {
        io.to(receiver.socketId).emit("new-message", newMessage);
      }

      // Kirim balik ke pengirim sebagai konfirmasi
      socket.emit("message-sent", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
      socket.emit("message-error", { error: "Gagal menyimpan pesan" });
    }
  });

  // Tandai pesan sudah dibaca
  socket.on("mark-read", async (data) => {
    const { message_ids, sender_id } = data;

    try {
      await pool.query(
        `UPDATE chat_messages SET is_read = true 
                 WHERE id = ANY($1::int[]) AND sender_id = $2`,
        [message_ids, sender_id],
      );

      // Kirim notifikasi ke pengirim bahwa pesan sudah dibaca
      const receiver = onlineUsers.get(sender_id);
      if (receiver) {
        io.to(receiver.socketId).emit("messages-read", { message_ids });
      }
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  });

  // User typing
  socket.on("typing", (data) => {
    const { receiver_id, is_typing } = data;
    const receiver = onlineUsers.get(receiver_id);
    if (receiver) {
      io.to(receiver.socketId).emit("user-typing", {
        user_id: socket.userId,
        user_name: socket.userName,
        is_typing: is_typing,
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
      console.log(`User ${socket.userName} disconnected`);
    }
  });
});

// ========== START SERVER ==========
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Socket.io chat server is ready`);
});

// ========== CRON SCHEDULER ==========
try {
  require("./cron/scheduler");
  console.log("[SERVER] Cron scheduler loaded successfully");
} catch (err) {
  console.error("[SERVER] Failed to load cron scheduler:", err.message);
}
