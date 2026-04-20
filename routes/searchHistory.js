const express = require("express");
const router = express.Router();
const searchHistoryController = require("../controllers/searchHistory");
const { verifyToken } = require("../middleware/auth");

// Semua endpoint butuh login
router.get(
  "/pengguna/:id_pengguna",
  verifyToken,
  searchHistoryController.getSearchHistory,
);
router.post("/", verifyToken, searchHistoryController.saveSearchHistory);
router.delete("/:id", verifyToken, searchHistoryController.deleteSearchHistory);
router.delete(
  "/pengguna/:id_pengguna/clear",
  verifyToken,
  searchHistoryController.clearSearchHistory,
);

module.exports = router;
