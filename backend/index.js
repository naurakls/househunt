require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const connectDB = require("./config/config");
const { sendSuccess, sendError } = require("./utils/response");

const userRoutes = require("./routes/userRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");

// JWT_KEY wajib ada, tanpa itu token tidak bisa dibuat/diverifikasi
if (!process.env.JWT_KEY) {
  console.error("JWT_KEY belum diisi di backend/.env");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware global
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Folder uploads disajikan sebagai file statis: http://localhost:8000/uploads/<nama-file>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check untuk memastikan server hidup
app.get("/", (req, res) => sendSuccess(res, "HouseHunt API berjalan"));

// Pemasangan routes
app.use("/api/users", userRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);

// Route yang tidak terdaftar
app.use((req, res) => sendError(res, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404));

// Penanganan error terakhir (misal body JSON rusak), tetap dengan format JSON
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return sendError(res, "Format JSON tidak valid", 400);
  if (err.type === "entity.too.large") return sendError(res, "Ukuran data terlalu besar", 413);
  console.error(err);
  return sendError(res, "Terjadi kesalahan pada server", 500);
});

// Server baru menerima request setelah database terhubung
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
});
