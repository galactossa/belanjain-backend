const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const { verifyToken } = require("../middleware/auth");

// Semua endpoint chat butuh autentikasi
router.get(
  "/history/:user_id/:other_id",
  verifyToken,
  chatController.getChatHistory,
);
router.get("/rooms/:user_id", verifyToken, chatController.getChatRooms);
router.get("/unread/:user_id", verifyToken, chatController.getUnreadCount);
router.delete("/:id", verifyToken, chatController.deleteMessage);

module.exports = router;
