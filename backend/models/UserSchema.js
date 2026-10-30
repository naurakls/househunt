const mongoose = require("mongoose");

const ROLES = ["renter", "owner", "admin"];
const GRANT_STATUS = ["pending", "granted", "rejected"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama wajib diisi"],
      trim: true,
      minlength: [2, "Nama minimal 2 karakter"],
      maxlength: [60, "Nama maksimal 60 karakter"],
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi"],
      unique: true, // otomatis membuat unique index -> email tidak bisa dipakai dua kali
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format email tidak valid"],
    },
    // Yang disimpan adalah HASH bcrypt, bukan password asli.
    // select: false -> password tidak ikut terambil di query biasa
    password: { type: String, required: [true, "Password wajib diisi"], select: false },
    phone: {
      type: String,
      required: [true, "Nomor HP wajib diisi"],
      trim: true,
      match: [/^\+?[0-9\s-]{9,20}$/, "Nomor HP tidak valid"],
    },
    type: {
      type: String,
      enum: { values: ROLES, message: "Role {VALUE} tidak dikenal" },
      default: "renter",
    },
    // Status approval: owner baru = "pending" sampai disetujui admin.
    // Renter & admin langsung "granted".
    granted: {
      type: String,
      enum: { values: GRANT_STATUS, message: "Status {VALUE} tidak dikenal" },
      default: "granted",
    },
  },
  {
    timestamps: true, // menambah createdAt & updatedAt otomatis
    // Lapisan keamanan kedua: password dihapus setiap kali dokumen diubah ke JSON
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Mempercepat filter admin, misal: semua owner yang masih pending
userSchema.index({ type: 1, granted: 1 });

const User = mongoose.model("User", userSchema);
User.ROLES = ROLES;
User.GRANT_STATUS = GRANT_STATUS;

module.exports = User;
