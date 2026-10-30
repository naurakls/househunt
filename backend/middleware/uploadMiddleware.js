const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { sendError } = require("../utils/response");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB per gambar
const MAX_FILES = 6;
// Hanya tipe gambar ini yang diterima. Ekstensi ditentukan dari MIME, bukan nama file user
const ALLOWED_TYPES = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  // Nama file acak agar tidak bentrok dan tidak bisa ditebak
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ALLOWED_TYPES[file.mimetype]}`),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
    const error = new Error("Format gambar harus JPG, PNG, atau WEBP");
    error.code = "INVALID_FILE_TYPE";
    cb(error);
  },
});

// Wrapper agar error multer dikembalikan dengan format JSON yang konsisten
const uploadPropertyImages = (req, res, next) => {
  upload.array("images", MAX_FILES)(req, res, (error) => {
    if (!error) return next();

    const messages = {
      LIMIT_FILE_SIZE: "Ukuran tiap gambar maksimal 2 MB",
      LIMIT_FILE_COUNT: `Maksimal ${MAX_FILES} gambar`,
      LIMIT_UNEXPECTED_FILE: `Maksimal ${MAX_FILES} gambar dengan field "images"`,
    };
    return sendError(res, messages[error.code] || error.message, 400);
  });
};

// Path yang disimpan di database, contoh: "uploads/1700000000-ab12cd.jpg"
const toImagePath = (file) => `uploads/${file.filename}`;

// Menghapus file gambar dari disk. path.basename mencegah path traversal (../)
const removeImages = (imagePaths = []) => {
  imagePaths.forEach((imagePath) => {
    if (/^https?:\/\//.test(imagePath)) return; // foto eksternal (Unsplash) tidak ada di disk
    const fullPath = path.join(UPLOAD_DIR, path.basename(imagePath));
    fs.unlink(fullPath, () => {}); // abaikan error jika file sudah tidak ada
  });
};

module.exports = { uploadPropertyImages, toImagePath, removeImages, MAX_FILES };
