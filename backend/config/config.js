const mongoose = require("mongoose");
const dns = require("dns");

// Connection string "mongodb+srv://" butuh lookup DNS tipe SRV.
// Beberapa resolver lokal (127.0.0.1, misal dari Laragon) menolak query SRV,
// jadi dalam kasus itu Node dialihkan ke DNS publik Google & Cloudflare.
const servers = dns.getServers();
if (servers.every((s) => s.startsWith("127.") || s === "::1")) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

// Koneksi ke MongoDB Atlas. Nama database dipaksa "houserent"
// supaya tetap benar walau connection string tidak menyebutkannya.
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes("ISI_CONNECTION_STRING")) {
    console.error("MONGO_URI belum diisi. Buka backend/.env lalu isi connection string Atlas kamu.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, { dbName: "houserent" });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Gagal terhubung ke MongoDB: ${error.message}`);
    console.error("Cek kembali username/password di MONGO_URI dan Network Access di Atlas.");
    process.exit(1);
  }
};

module.exports = connectDB;
