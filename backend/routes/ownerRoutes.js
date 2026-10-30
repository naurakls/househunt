// Route owner. Prefix: /api/owner
const express = require("express");
const {
  createProperty,
  getMyProperties,
  getMyPropertyById,
  updateProperty,
  deleteProperty,
  getOwnerBookings,
  updateBookingStatus,
} = require("../controllers/ownerController");
const { protect, authorize, requireApprovedOwner } = require("../middleware/authMiddleware");
const { uploadPropertyImages } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Semua route di bawah ini: wajib login + role owner + sudah disetujui admin
router.use(protect, authorize("owner"), requireApprovedOwner);

router.get("/properties", getMyProperties);
router.post("/properties", uploadPropertyImages, createProperty);
router.get("/properties/:id", getMyPropertyById);
router.put("/properties/:id", uploadPropertyImages, updateProperty);
router.delete("/properties/:id", deleteProperty);

router.get("/bookings", getOwnerBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

module.exports = router;
