// Route admin. Prefix: /api/admin
const express = require("express");
const {
  getStats,
  getUsers,
  approveOwner,
  rejectOwner,
  getAllProperties,
  getAllBookings,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Semua route di bawah ini khusus admin
router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/owners/:id/approve", approveOwner);
router.patch("/owners/:id/reject", rejectOwner);
router.get("/properties", getAllProperties);
router.get("/bookings", getAllBookings);

module.exports = router;
