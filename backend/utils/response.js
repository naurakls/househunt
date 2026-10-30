// Format respons JSON yang seragam di seluruh API: { success, message, data }

const sendSuccess = (res, message, data = null, status = 200) =>
  res.status(status).json({ success: true, message, data });

const sendError = (res, message, status = 400, data = null) =>
  res.status(status).json({ success: false, message, data });

// Menerjemahkan error umum Mongoose menjadi pesan yang ramah
const handleError = (res, error, fallback = "Terjadi kesalahan pada server") => {
  if (error.name === "CastError") return sendError(res, "ID tidak valid", 400);
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((e) => e.message);
    return sendError(res, errors[0], 400, { errors });
  }
  if (error.code === 11000) return sendError(res, "Data sudah terdaftar", 409);

  console.error(error);
  return sendError(res, fallback, 500);
};

module.exports = { sendSuccess, sendError, handleError };
