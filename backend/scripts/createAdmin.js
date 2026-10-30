// Membuat (atau memperbarui) akun admin. Admin sengaja tidak bisa dibuat lewat API register.
// Pemakaian: npm run create-admin -- "Nama Admin" admin@email.com passwordRahasia
require("dotenv").config({ quiet: true });
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/config");
const User = require("../models/UserSchema");

const [name, email, password] = process.argv.slice(2);

const run = async () => {
  if (!name || !email || !password || password.length < 6) {
    console.error('Pemakaian: npm run create-admin -- "Nama Admin" email password(min 6 karakter)');
    process.exit(1);
  }

  await connectDB();
  const hashedPassword = await bcrypt.hash(password, 10);

  // upsert: kalau email sudah ada, akun itu dijadikan admin & password diganti
  const admin = await User.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { name, password: hashedPassword, phone: "000000000", type: "admin", granted: "granted" },
    { upsert: true, returnDocument: "after", runValidators: true }
  );

  console.log(`Admin siap: ${admin.email}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Gagal membuat admin:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
