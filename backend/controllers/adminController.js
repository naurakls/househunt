// Fitur admin: mengelola user, approval owner, dan memantau seluruh data
const User = require("../models/UserSchema");
const Property = require("../models/PropertySchema");
const Booking = require("../models/BookingSchema");
const { sendSuccess, sendError, handleError } = require("../utils/response");
const { escapeRegex, getPagination, buildPaginationMeta } = require("../utils/validators");

// GET /api/admin/stats -> angka ringkasan untuk kartu di dashboard admin
const getStats = async (req, res) => {
  try {
    const [renters, owners, pendingOwners, properties, available, pending, booked, rejected] =
      await Promise.all([
        User.countDocuments({ type: "renter" }),
        User.countDocuments({ type: "owner" }),
        User.countDocuments({ type: "owner", granted: "pending" }),
        Property.countDocuments(),
        Property.countDocuments({ isAvailable: true }),
        Booking.countDocuments({ bookingStatus: "pending" }),
        Booking.countDocuments({ bookingStatus: "booked" }),
        Booking.countDocuments({ bookingStatus: "rejected" }),
      ]);

    return sendSuccess(res, "Statistik", {
      users: { renters, owners, pendingOwners },
      properties: { total: properties, available, rented: properties - available },
      bookings: { total: pending + booked + rejected, pending, booked, rejected },
    });
  } catch (error) {
    return handleError(res, error, "Gagal mengambil statistik");
  }
};

// GET /api/admin/users?type=owner&granted=pending&search=budi&page=1
const getUsers = async (req, res) => {
  try {
    const { type, granted, search } = req.query;
    const filter = {};
    if (["renter", "owner", "admin"].includes(type)) filter.type = type;
    if (["pending", "granted", "rejected"].includes(granted)) filter.granted = granted;
    if (search && search.trim()) {
      const pattern = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ name: pattern }, { email: pattern }];
    }

    const { page, limit, skip } = getPagination(req.query, 10);
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), // password otomatis tidak ikut
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, "Daftar user", { items, pagination: buildPaginationMeta(page, limit, total) });
  } catch (error) {
    return handleError(res, error, "Gagal mengambil daftar user");
  }
};

// Dipakai approve & reject: ubah status granted milik seorang owner
const setOwnerStatus = (status) => async (req, res) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, type: "owner" });
    if (!owner) return sendError(res, "Owner tidak ditemukan", 404);

    owner.granted = status;
    await owner.save();

    const message = status === "granted" ? "Owner berhasil disetujui" : "Owner berhasil ditolak";
    return sendSuccess(res, message, owner);
  } catch (error) {
    return handleError(res, error, "Gagal memperbarui status owner");
  }
};

// GET /api/admin/properties?page=1
const getAllProperties = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query, 10);
    const [items, total] = await Promise.all([
      Property.find()
        .populate("ownerId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(),
    ]);
    return sendSuccess(res, "Semua properti", { items, pagination: buildPaginationMeta(page, limit, total) });
  } catch (error) {
    return handleError(res, error, "Gagal mengambil properti");
  }
};

// GET /api/admin/bookings?status=pending&page=1
const getAllBookings = async (req, res) => {
  try {
    const filter = {};
    if (["pending", "booked", "rejected"].includes(req.query.status)) {
      filter.bookingStatus = req.query.status;
    }

    const { page, limit, skip } = getPagination(req.query, 10);
    const [items, total] = await Promise.all([
      Booking.find(filter)
        .populate("propertyId", "address city propertyType rentAmount")
        .populate("ownerId", "name email")
        .populate("renterId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);
    return sendSuccess(res, "Semua booking", { items, pagination: buildPaginationMeta(page, limit, total) });
  } catch (error) {
    return handleError(res, error, "Gagal mengambil booking");
  }
};

module.exports = {
  getStats,
  getUsers,
  approveOwner: setOwnerStatus("granted"),
  rejectOwner: setOwnerStatus("rejected"),
  getAllProperties,
  getAllBookings,
};
