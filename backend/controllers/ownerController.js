// Fitur owner: CRUD properti miliknya dan mengelola booking yang masuk
const Property = require("../models/PropertySchema");
const Booking = require("../models/BookingSchema");
const Message = require("../models/MessageSchema");
const { sendSuccess, sendError, handleError } = require("../utils/response");
const { isPhone, parseList, toBoolean } = require("../utils/validators");
const { toImagePath, removeImages, MAX_FILES } = require("../middleware/uploadMiddleware");

// Validasi & bersihkan input properti.
// partial = true dipakai saat update (field yang tidak dikirim tidak diwajibkan)
const buildPropertyData = (body, partial) => {
  const errors = [];
  const data = {};
  const provided = (key) => body[key] !== undefined && body[key] !== "";
  const required = (key, message) => {
    if (!partial && !provided(key)) errors.push(message);
    return provided(key);
  };

  if (required("propertyType", "Tipe properti wajib diisi")) {
    if (Property.PROPERTY_TYPES.includes(body.propertyType)) data.propertyType = body.propertyType;
    else errors.push(`Tipe properti harus salah satu dari: ${Property.PROPERTY_TYPES.join(", ")}`);
  }

  if (provided("adType")) {
    if (Property.AD_TYPES.includes(body.adType)) data.adType = body.adType;
    else errors.push("Jenis iklan harus rent atau sale");
  }

  if (required("address", "Alamat wajib diisi")) {
    if (body.address.trim().length >= 5) data.address = body.address.trim();
    else errors.push("Alamat minimal 5 karakter");
  }

  if (required("city", "Kota wajib diisi")) {
    if (body.city.trim().length >= 2) data.city = body.city.trim();
    else errors.push("Nama kota minimal 2 karakter");
  }

  if (required("rentAmount", "Harga sewa wajib diisi")) {
    const amount = Number(body.rentAmount);
    if (Number.isFinite(amount) && amount > 0) data.rentAmount = amount;
    else errors.push("Harga sewa harus berupa angka lebih dari 0");
  }

  if (body.amenities !== undefined) {
    const list = [...new Set(parseList(body.amenities))]; // hapus duplikat
    if (list.length > 20) errors.push("Maksimal 20 fasilitas");
    else data.amenities = list;
  }

  if (body.description !== undefined) {
    if (String(body.description).length <= 2000) data.description = String(body.description).trim();
    else errors.push("Deskripsi maksimal 2000 karakter");
  }

  // Spesifikasi: bilangan bulat (kamar) dan angka positif (luas). String kosong = dikosongkan.
  const parseCount = (key, label) => {
    if (body[key] === undefined) return;
    if (body[key] === "") return (data[key] = undefined);
    const n = Number(body[key]);
    if (Number.isInteger(n) && n >= 0 && n <= 20) data[key] = n;
    else errors.push(`${label} harus angka bulat 0–20`);
  };
  parseCount("bedrooms", "Jumlah kamar tidur");
  parseCount("bathrooms", "Jumlah kamar mandi");

  if (body.area !== undefined) {
    if (body.area === "") data.area = undefined;
    else if (Number(body.area) > 0 && Number(body.area) <= 100000) data.area = Number(body.area);
    else errors.push("Luas bangunan harus angka lebih dari 0");
  }

  if (body.tourUrl !== undefined) {
    const url = String(body.tourUrl).trim();
    if (!url || /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(url)) data.tourUrl = url;
    else errors.push("Link video tour harus link YouTube, contoh https://www.youtube.com/watch?v=xxxxxxxxxxx");
  }

  if (provided("ownerContact")) {
    if (isPhone(body.ownerContact)) data.ownerContact = body.ownerContact.trim();
    else errors.push("Nomor kontak owner tidak valid");
  }

  if (body.isAvailable !== undefined) data.isAvailable = toBoolean(body.isAvailable);

  return { errors, data };
};

// POST /api/owner/properties  (multipart/form-data, field gambar: "images")
const createProperty = async (req, res) => {
  const newImages = (req.files || []).map(toImagePath);
  try {
    const { errors, data } = buildPropertyData(req.body || {}, false);
    if (!newImages.length) errors.push("Minimal unggah 1 foto properti");
    if (errors.length) {
      removeImages(newImages); // file yang terlanjur diupload dihapus lagi
      return sendError(res, errors[0], 400, { errors });
    }

    const property = await Property.create({
      ...data,
      ownerId: req.user._id,
      ownerContact: data.ownerContact || req.user.phone,
      images: newImages,
    });
    return sendSuccess(res, "Properti berhasil ditambahkan", property, 201);
  } catch (error) {
    removeImages(newImages);
    return handleError(res, error, "Gagal menambahkan properti");
  }
};

// GET /api/owner/properties
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).lean();
    return sendSuccess(res, "Daftar properti kamu", properties);
  } catch (error) {
    return handleError(res, error, "Gagal mengambil properti");
  }
};

// GET /api/owner/properties/:id  (dipakai form edit)
const getMyPropertyById = async (req, res) => {
  try {
    // Filter ownerId memastikan owner tidak bisa membuka properti owner lain
    const property = await Property.findOne({ _id: req.params.id, ownerId: req.user._id }).lean();
    if (!property) return sendError(res, "Properti tidak ditemukan", 404);
    return sendSuccess(res, "Detail properti", property);
  } catch (error) {
    return handleError(res, error, "Gagal mengambil properti");
  }
};

// PUT /api/owner/properties/:id  (multipart/form-data)
// keepImages = daftar path gambar lama yang dipertahankan; gambar baru lewat field "images"
const updateProperty = async (req, res) => {
  const newImages = (req.files || []).map(toImagePath);
  try {
    const property = await Property.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!property) {
      removeImages(newImages);
      return sendError(res, "Properti tidak ditemukan", 404);
    }

    const body = req.body || {};
    const { errors, data } = buildPropertyData(body, true);

    // Jika keepImages tidak dikirim, semua gambar lama dipertahankan
    const keep =
      body.keepImages !== undefined
        ? property.images.filter((img) => parseList(body.keepImages).includes(img))
        : property.images;
    const finalImages = [...keep, ...newImages];
    if (!finalImages.length) errors.push("Properti harus punya minimal 1 foto");
    if (finalImages.length > MAX_FILES) errors.push(`Total foto maksimal ${MAX_FILES}`);

    if (errors.length) {
      removeImages(newImages);
      return sendError(res, errors[0], 400, { errors });
    }

    const removed = property.images.filter((img) => !keep.includes(img));
    Object.assign(property, data, { images: finalImages });
    await property.save();
    removeImages(removed); // hapus file lama setelah data tersimpan

    return sendSuccess(res, "Properti berhasil diperbarui", property);
  } catch (error) {
    removeImages(newImages);
    return handleError(res, error, "Gagal memperbarui properti");
  }
};

// DELETE /api/owner/properties/:id
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!property) return sendError(res, "Properti tidak ditemukan", 404);

    // Bersihkan data terkait agar tidak ada booking/pesan "yatim"
    await Promise.all([
      Booking.deleteMany({ propertyId: property._id }),
      Message.deleteMany({ propertyId: property._id }),
    ]);
    removeImages(property.images);

    return sendSuccess(res, "Properti berhasil dihapus");
  } catch (error) {
    return handleError(res, error, "Gagal menghapus properti");
  }
};

// GET /api/owner/bookings?status=pending
const getOwnerBookings = async (req, res) => {
  try {
    const filter = { ownerId: req.user._id };
    if (["pending", "booked", "rejected"].includes(req.query.status)) {
      filter.bookingStatus = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate("propertyId", "address city propertyType rentAmount images isAvailable")
      .populate("renterId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, "Daftar booking masuk", bookings);
  } catch (error) {
    return handleError(res, error, "Gagal mengambil booking");
  }
};

// PATCH /api/owner/bookings/:id/status  body: { status: "booked" | "rejected" }
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!["booked", "rejected"].includes(status)) {
      return sendError(res, "Status harus booked atau rejected", 400);
    }

    const booking = await Booking.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!booking) return sendError(res, "Booking tidak ditemukan", 404);
    if (booking.bookingStatus === status) {
      return sendError(res, `Booking sudah berstatus ${status}`, 400);
    }

    const property = await Property.findById(booking.propertyId);
    if (!property) return sendError(res, "Properti untuk booking ini sudah tidak ada", 404);

    if (status === "booked") {
      if (!property.isAvailable) {
        return sendError(res, "Properti sudah disewa oleh penyewa lain", 409);
      }
      booking.bookingStatus = "booked";
      property.isAvailable = false; // properti otomatis berstatus "Disewa"
      await Promise.all([booking.save(), property.save()]);

      // Booking lain yang masih pending untuk properti ini otomatis ditolak
      await Booking.updateMany(
        { propertyId: property._id, _id: { $ne: booking._id }, bookingStatus: "pending" },
        { bookingStatus: "rejected" }
      );
    } else {
      const wasBooked = booking.bookingStatus === "booked";
      booking.bookingStatus = "rejected";
      await booking.save();
      // Jika booking yang sebelumnya disetujui dibatalkan, properti tersedia lagi
      if (wasBooked) {
        property.isAvailable = true;
        await property.save();
      }
    }

    return sendSuccess(
      res,
      status === "booked" ? "Booking disetujui" : "Booking ditolak",
      booking
    );
  } catch (error) {
    return handleError(res, error, "Gagal memperbarui status booking");
  }
};

module.exports = {
  createProperty,
  getMyProperties,
  getMyPropertyById,
  updateProperty,
  deleteProperty,
  getOwnerBookings,
  updateBookingStatus,
};
