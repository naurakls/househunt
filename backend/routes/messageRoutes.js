// Route pesan. Prefix: /api/messages
const express = require("express");
const {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  markAsRead,
} = require("../controllers/messageController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Pesan hanya untuk renter & owner yang sudah login
router.use(protect, authorize("renter", "owner"));

router.post("/", sendMessage);
router.get("/conversations", getConversations);
router.get("/unread-count", getUnreadCount);
router.get("/property/:propertyId", getConversation);
router.patch("/property/:propertyId/read", markAsRead);

module.exports = router;
