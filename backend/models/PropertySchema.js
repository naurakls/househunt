const mongoose = require("mongoose");

const PROPERTY_TYPES = ["rumah", "apartemen", "kos", "villa", "ruko"];
const AD_TYPES = ["rent", "sale"]; // rent = disewakan, sale = dijual
const MAX_IMAGES = 6;

const propertySchema = new mongoose.Schema(
  {
    // Relasi ke pemilik properti (collection users)
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyType: {
      type: String,
      required: [true, "Tipe properti wajib diisi"],
      enum: { values: PROPERTY_TYPES, message: "Tipe properti {VALUE} tidak dikenal" },
    },
    adType: {
      type: String,
      enum: { values: AD_TYPES, message: "Jenis iklan harus rent atau sale" },
      default: "rent",
    },
    address: {
      type: String,
      required: [true, "Alamat wajib diisi"],
      trim: true,
      minlength: [5, "Alamat minimal 5 karakter"],
      maxlength: [200, "Alamat maksimal 200 karakter"],
    },
    city: {
      type: String,
      required: [true, "Kota wajib diisi"],
      trim: true,
      minlength: [2, "Nama kota minimal 2 karakter"],
      maxlength: [60, "Nama kota maksimal 60 karakter"],
    },
    amenities: {
      type: [{ type: String, trim: true, maxlength: [40, "Nama fasilitas maksimal 40 karakter"] }],
      default: [],
      validate: { validator: (list) => list.length <= 20, message: "Maksimal 20 fasilitas" },
    },
    // Harga per bulan (rent) atau harga jual (sale), dalam Rupiah
    rentAmount: {
      type: Number,
      required: [true, "Harga sewa wajib diisi"],
      min: [1, "Harga harus lebih dari 0"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Deskripsi maksimal 2000 karakter"],
    },
    // Path relatif file di folder uploads ("uploads/1700000000-ab12cd.jpg"),
    // atau URL lengkap untuk foto contoh dari Unsplash

    images: {
      type: [String],
      default: [],
      validate: { validator: (list) => list.length <= MAX_IMAGES, message: `Maksimal ${MAX_IMAGES} foto` },
    },
    // Spesifikasi yang biasa dicari penyewa
    bedrooms: { type: Number, min: [0, "Jumlah kamar tidak valid"], max: [20, "Maksimal 20 kamar tidur"] },
    bathrooms: { type: Number, min: [0, "Jumlah kamar mandi tidak valid"], max: [20, "Maksimal 20 kamar mandi"] },
    area: { type: Number, min: [1, "Luas minimal 1 m²"], max: [100000, "Luas terlalu besar"] }, // luas bangunan (m²)
    // Virtual tour: link video YouTube (opsional)
    tourUrl: {
      type: String,
      trim: true,
      default: "",
      match: [/^$|^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/, "Link video tour harus dari YouTube"],
    },
    ownerContact: {
      type: String,
      trim: true,
      match: [/^\+?[0-9\s-]{9,20}$/, "Nomor kontak tidak valid"],
    },
    // false = sudah disewa (badge "Disewa")
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

// Index pada field yang sering difilter agar pencarian tetap cepat walau data banyak
propertySchema.index({ city: 1 });
propertySchema.index({ rentAmount: 1 });
propertySchema.index({ propertyType: 1 });
// Compound index untuk kombinasi filter paling umum di search bar (kota + tipe + harga)
propertySchema.index({ city: 1, propertyType: 1, rentAmount: 1 });
// Multikey index: membantu filter fasilitas ($all)
propertySchema.index({ amenities: 1 });
propertySchema.index({ bedrooms: 1 }); // filter "minimal kamar tidur"
propertySchema.index({ ownerId: 1 }); // dashboard owner
propertySchema.index({ createdAt: -1 }); // urutan default "terbaru"

const Property = mongoose.model("Property", propertySchema);
Property.PROPERTY_TYPES = PROPERTY_TYPES;
Property.AD_TYPES = AD_TYPES;
Property.MAX_IMAGES = MAX_IMAGES;

module.exports = Property;
