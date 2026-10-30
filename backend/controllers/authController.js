const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");
const { sendSuccess, sendError, handleError } = require("../utils/response");
const { isEmail, isPhone } = require("../utils/validators");

// Token JWT berisi id & role user, berlaku 7 hari
const createToken = (user) =>
  jwt.sign({ id: user._id, type: user.type }, process.env.JWT_KEY, { expiresIn: "7d" });

// POST /api/users/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, type = "renter" } = req.body || {};

    const errors = [];
    if (!name || !name.trim()) errors.push("Nama wajib diisi");
    if (!isEmail(email)) errors.push("Format email tidak valid");
    if (!password || password.length < 6) errors.push("Password minimal 6 karakter");
    if (!isPhone(phone)) errors.push("Nomor HP tidak valid (9-15 digit)");
    // Admin tidak bisa mendaftar sendiri lewat API
    if (!["renter", "owner"].includes(type)) errors.push("Tipe akun harus renter atau owner");
    if (errors.length) return sendError(res, errors[0], 400, { errors });

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return sendError(res, "Email sudah terdaftar", 409);
    }

    // Password di-hash dengan bcrypt (salt 10) sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
      type,
      granted: type === "owner" ? "pending" : "granted",
    });

    const message =
      type === "owner"
        ? "Registrasi berhasil. Akun owner kamu menunggu persetujuan admin."
        : "Registrasi berhasil";
    return sendSuccess(res, message, { token: createToken(user), user }, 201);
  } catch (error) {
    return handleError(res, error, "Registrasi gagal");
  }
};

// POST /api/users/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!isEmail(email) || !password) {
      return sendError(res, "Email dan password wajib diisi", 400);
    }

    // +password: ambil field password khusus untuk dicocokkan
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    // Pesan disamakan agar orang lain tidak bisa menebak email mana yang terdaftar
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendError(res, "Email atau password salah", 401);
    }

    // toJSON di schema otomatis menghapus password dari respons
    return sendSuccess(res, "Login berhasil", { token: createToken(user), user });
  } catch (error) {
    return handleError(res, error, "Login gagal");
  }
};

// GET /api/users/me -> data user yang sedang login (dari token)
const getMe = async (req, res) => sendSuccess(res, "Data user", req.user);

module.exports = { register, login, getMe };
