// Fitur renter: mengajukan booking dan melihat status booking sendiri
const Booking = require("../models/BookingSchema");
const Property = require("../models/PropertySchema");
const { sendSuccess, sendError, handleError } = require("../utils/response");
const { isObjectId, isPhone } = require("../utils/validators");

const PROPERTY_SUMMARY = "address city propertyType adType rentAmount images isAvailable";

// POST /api/users/bookings  body: { propertyId, renterName?, renterContact? }
const createBooking = async (req, res) => {
  try {
    const { propertyId, renterName, renterContact } = req.body || {};
    if (!isObjectId(propertyId)) return sendError(res, "propertyId tidak valid", 400);

    const property = await Property.findById(propertyId);
    if (!property) return sendError(res, "Properti tidak ditemukan", 404);
    if (!property.isAvailable) return sendError(res, "Properti ini sudah disewa", 409);

    // Cegah booking ganda untuk properti yang sama
    const existing = await Booking.exists({
      propertyId,
      renterId: req.user._id,
      bookingStatus: { $in: ["pending", "booked"] },
    });
    if (existing) return sendError(res, "Kamu sudah mengajukan booking untuk properti ini", 409);

    // Nama & kontak default diambil dari profil renter
    const name = (renterName || req.user.name).trim();
    const contact = (renterContact || req.user.phone).trim();
    if (!name) return sendError(res, "Nama penyewa wajib diisi", 400);
    if (!isPhone(contact)) return sendError(res, "Nomor kontak tidak valid", 400);

    const booking = await Booking.create({
      propertyId,
      ownerId: property.ownerId, // owner diambil dari properti, bukan dari input user
      renterId: req.user._id,
      renterName: name,
      renterContact: contact,
    });

    return sendSuccess(res, "Booking berhasil diajukan, tunggu konfirmasi owner", booking, 201);
  } catch (error) {
    return handleError(res, error, "Gagal membuat booking");
  }
};

// GET /api/users/bookings?status=pending
const getMyBookings = async (req, res) => {
  try {
    const filter = { renterId: req.user._id };
    if (["pending", "booked", "rejected"].includes(req.query.status)) {
      filter.bookingStatus = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate("propertyId", PROPERTY_SUMMARY)
      .populate("ownerId", "name phone")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, "Daftar booking kamu", bookings);
  } catch (error) {
    return handleError(res, error, "Gagal mengambil booking");
  }
};

module.exports = { createBooking, getMyBookings };
