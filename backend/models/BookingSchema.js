const mongoose = require("mongoose");

// pending = menunggu owner, booked = disetujui, rejected = ditolak
const BOOKING_STATUS = ["pending", "booked", "rejected"];

const bookingSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    // ownerId disimpan langsung (denormalisasi) agar owner bisa melihat booking
    // miliknya tanpa harus join ke collection properties terlebih dahulu
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    renterName: {
      type: String,
      required: [true, "Nama penyewa wajib diisi"],
      trim: true,
      maxlength: [60, "Nama penyewa maksimal 60 karakter"],
    },
    renterContact: {
      type: String,
      required: [true, "Kontak penyewa wajib diisi"],
      trim: true,
      match: [/^\+?[0-9\s-]{9,20}$/, "Nomor kontak tidak valid"],
    },
    bookingStatus: {
      type: String,
      enum: { values: BOOKING_STATUS, message: "Status booking {VALUE} tidak dikenal" },
      default: "pending",
    },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

// Dashboard owner & renter selalu memfilter berdasarkan id masing-masing, urut terbaru
bookingSchema.index({ ownerId: 1, createdAt: -1 });
bookingSchema.index({ renterId: 1, createdAt: -1 });
// Cek booking ganda & menolak booking pending lain saat properti disetujui
bookingSchema.index({ propertyId: 1, bookingStatus: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
Booking.BOOKING_STATUS = BOOKING_STATUS;

module.exports = Booking;
