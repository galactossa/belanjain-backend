const pool = require("../db/db");
const {
  success,
  error,
  notFound,
  badRequest,
} = require("../middleware/responseFormatter");

// GET riwayat chat antara dua user
const getChatHistory = async (req, res) => {
  const { user_id, other_id } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Hitung total
    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM chat_messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)`,
      [user_id, other_id],
    );
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / parseInt(limit));

    // Ambil pesan
    const result = await pool.query(
      `SELECT 
          cm.*,
          s.nama as sender_name,
          s.role as sender_role,
          r.nama as receiver_name,
          r.role as receiver_role
       FROM chat_messages cm
       JOIN pengguna s ON cm.sender_id = s.id_pengguna
       JOIN pengguna r ON cm.receiver_id = r.id_pengguna
       WHERE (cm.sender_id = $1 AND cm.receiver_id = $2) 
          OR (cm.sender_id = $2 AND cm.receiver_id = $1)
       ORDER BY cm.created_at ASC
       LIMIT $3 OFFSET $4`,
      [user_id, other_id, parseInt(limit), offset],
    );

    // Tandai pesan yang diterima sebagai sudah dibaca
    await pool.query(
      `UPDATE chat_messages SET is_read = true 
       WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false`,
      [user_id, other_id],
    );

    return success(
      res,
      {
        data: result.rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total_data: totalData,
          total_page: totalPage,
        },
      },
      "Chat history retrieved successfully",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET daftar chat rooms (user yang pernah chat)
const getChatRooms = async (req, res) => {
  const { user_id } = req.params;

  try {
    // Ambil daftar user yang pernah chat
    const result = await pool.query(
      `SELECT DISTINCT 
          CASE 
              WHEN cm.sender_id = $1 THEN cm.receiver_id
              ELSE cm.sender_id
          END as other_user_id,
          p.nama as other_user_name,
          p.role as other_user_role,
          p.url_foto as other_user_avatar
       FROM chat_messages cm
       JOIN pengguna p ON p.id_pengguna = (
           CASE 
               WHEN cm.sender_id = $1 THEN cm.receiver_id
               ELSE cm.sender_id
           END
       )
       WHERE cm.sender_id = $1 OR cm.receiver_id = $1`,
      [user_id],
    );

    // Ambil last message dan unread count untuk setiap room
    const rooms = [];
    for (const room of result.rows) {
      // Ambil last message
      const lastMsgRes = await pool.query(
        `SELECT message, created_at FROM chat_messages 
         WHERE (sender_id = $1 AND receiver_id = $2)
            OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at DESC LIMIT 1`,
        [user_id, room.other_user_id],
      );

      // Ambil unread count
      const unreadRes = await pool.query(
        `SELECT COUNT(*) as unread FROM chat_messages 
         WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
        [room.other_user_id, user_id],
      );

      rooms.push({
        other_user_id: room.other_user_id,
        other_user_name: room.other_user_name,
        other_user_role: room.other_user_role,
        other_user_avatar: room.other_user_avatar,
        last_message: lastMsgRes.rows[0]?.message || null,
        last_message_time: lastMsgRes.rows[0]?.created_at || null,
        unread_count: parseInt(unreadRes.rows[0].unread),
      });
    }

    // Sort by last message time
    rooms.sort((a, b) => {
      if (!a.last_message_time) return 1;
      if (!b.last_message_time) return -1;
      return new Date(b.last_message_time) - new Date(a.last_message_time);
    });

    return success(res, rooms, "Chat rooms retrieved successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// GET unread message count
const getUnreadCount = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) as unread_count 
       FROM chat_messages 
       WHERE receiver_id = $1 AND is_read = false`,
      [user_id],
    );

    return success(
      res,
      { unread_count: parseInt(result.rows[0].unread_count) },
      "Unread count retrieved",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// DELETE chat message (soft delete - hanya untuk admin)
const deleteMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM chat_messages WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return notFound(res, "Pesan tidak ditemukan");
    }

    return success(res, null, "Pesan berhasil dihapus");
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

module.exports = {
  getChatHistory,
  getChatRooms,
  getUnreadCount,
  deleteMessage,
};
