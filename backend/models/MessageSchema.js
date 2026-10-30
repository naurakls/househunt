const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Setiap pesan selalu terkait satu properti -> percakapan dikelompokkan per properti
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator(value) {
          return !this.senderId || !value.equals(this.senderId);
        },
        message: "Tidak bisa mengirim pesan ke diri sendiri",
      },
    },
    text: {
      type: String,
      required: [true, "Pesan tidak boleh kosong"],
      trim: true,
      maxlength: [1000, "Pesan maksimal 1000 karakter"],
    },
    isRead: { type: Boolean, default: false }, // untuk badge "belum dibaca"
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

// Mengambil isi satu percakapan (properti + dua user) secara berurutan
messageSchema.index({ propertyId: 1, senderId: 1, receiverId: 1, createdAt: 1 });
// Menghitung pesan belum dibaca milik penerima
messageSchema.index({ receiverId: 1, isRead: 1 });
// Daftar percakapan: mencari semua pesan yang dikirim user
messageSchema.index({ senderId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
