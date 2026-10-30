const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");
const { sendError } = require("../utils/response");

// 1) protect: wajib login. Token dikirim di header "Authorization: Bearer <token>"
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return sendError(res, "Silakan login terlebih dahulu", 401);
    }

    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_KEY);

    // User diambil ulang dari database agar perubahan role/status
    // (misal owner baru disetujui admin) langsung berlaku tanpa login ulang
    const user = await User.findById(decoded.id);
    if (!user) return sendError(res, "Akun tidak ditemukan", 401);

    req.user = user;
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Sesi kamu sudah habis, silakan login ulang"
        : "Token tidak valid, silakan login ulang";
    return sendError(res, message, 401);
  }
};

// 2) authorize: membatasi route hanya untuk role tertentu, contoh authorize("admin")
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.type)) {
    return sendError(res, "Kamu tidak punya akses ke fitur ini", 403);
  }
  next();
};

// 3) requireApprovedOwner: owner hanya bisa mengelola properti setelah disetujui admin
const requireApprovedOwner = (req, res, next) => {
  if (req.user.type === "owner" && req.user.granted !== "granted") {
    const message =
      req.user.granted === "rejected"
        ? "Akun owner kamu ditolak oleh admin"
        : "Akun owner kamu masih menunggu persetujuan admin";
    return sendError(res, message, 403);
  }
  next();
};

module.exports = { protect, authorize, requireApprovedOwner };
