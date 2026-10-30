// Route auth + fitur renter. Prefix: /api/users
const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { getProperties, getPropertyById, getCities } = require("../controllers/propertyController");
const { createBooking, getMyBookings } = require("../controllers/bookingController");
const { getInsights } = require("../controllers/insightsController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Properti: publik, tamu boleh melihat-lihat tanpa login
router.get("/properties", getProperties);
router.get("/cities", getCities);
router.get("/insights", getInsights); // market insights (publik)
router.get("/properties/:id", getPropertyById);

// Booking: khusus renter yang sudah login
router.post("/bookings", protect, authorize("renter"), createBooking);
router.get("/bookings", protect, authorize("renter"), getMyBookings);

module.exports = router;
