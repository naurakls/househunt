// Mengisi database "houserent" di Atlas dengan data contoh untuk demo.
// Jalankan: npm run seed
// Aman diulang: hanya data seed (email @househunt.test) yang dihapus & dibuat ulang,
// data lain milikmu tidak disentuh.
// Foto contoh: Unsplash (https://unsplash.com/license), disimpan sebagai URL sehingga tidak perlu diunduh.
require("dotenv").config({ quiet: true });
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./config/config");
const User = require("./models/UserSchema");
const Property = require("./models/PropertySchema");
const Booking = require("./models/BookingSchema");
const Message = require("./models/MessageSchema");

const SEED_DOMAIN = "@househunt.test"; // penanda data seed
const SEED_PASSWORD = "password123"; // password semua akun contoh
const UPLOAD_DIR = path.join(__dirname, "uploads");

// URL dasar foto Unsplash; ukuran (lebar) ditentukan oleh frontend
const photo = (id) => `https://images.unsplash.com/photo-${id}`;
const yt = (id) => `https://www.youtube.com/watch?v=${id}`;

// ---------- Data contoh ----------
const usersData = [
  { key: "admin", name: "Admin HouseHunt", email: "admin", phone: "081100000001", type: "admin" },
  { key: "andi", name: "Andi Pratama", email: "andi.owner", phone: "081234560001", type: "owner" },
  { key: "rina", name: "Rina Wulandari", email: "rina.owner", phone: "081234560002", type: "owner" },
  { key: "maya", name: "Maya Lestari", email: "maya.owner", phone: "081234560003", type: "owner" },
  { key: "sari", name: "Sari Kusuma", email: "sari.renter", phone: "085700000001", type: "renter" },
  { key: "dimas", name: "Dimas Saputra", email: "dimas.renter", phone: "085700000002", type: "renter" },
  { key: "putri", name: "Putri Anggraini", email: "putri.renter", phone: "085700000003", type: "renter" },
];

const propertiesData = [
  {
    owner: "andi", propertyType: "rumah", city: "Bandung", rentAmount: 4500000,
    bedrooms: 2, bathrooms: 1, area: 90, tourUrl: yt("FWm1Y8zP4Os"),
    address: "Jl. Dago Asri No. 14, Coblong",
    amenities: ["WiFi", "Parkir", "Dapur", "Taman", "Air Panas"],
    images: ["1598228723793-52759bba239c", "1600210492486-724fe5c67fb0", "1505693416388-ac5ce068fe85"],
    description: "Rumah dua kamar dengan taman kecil di kawasan Dago yang sejuk. Lima menit ke kampus dan kafe-kafe Dago, lingkungan tenang dan aman.",
  },
  {
    owner: "andi", propertyType: "kos", city: "Yogyakarta", rentAmount: 1200000,
    bedrooms: 1, bathrooms: 1, area: 16,
    address: "Jl. Kaliurang Km 5, Sleman",
    amenities: ["WiFi", "AC", "Kamar Mandi Dalam", "Laundry"],
    images: ["1631049307264-da0ec9d70304", "1502672260266-1c1ef2d93688"],
    description: "Kamar kos eksklusif khusus mahasiswa, sudah termasuk listrik, air, dan WiFi. Dekat kampus dan warung makan.",
  },
  {
    owner: "andi", propertyType: "apartemen", city: "Jakarta Selatan", rentAmount: 7500000,
    bedrooms: 2, bathrooms: 2, area: 72,
    address: "Jl. TB Simatupang Kav. 8, Cilandak",
    amenities: ["WiFi", "AC", "Kolam Renang", "Gym", "Keamanan 24 Jam", "Parkir"],
    images: ["1515263487990-61b07816b324", "1600607687939-ce8a6c25118c", "1616594039964-ae9021a400a0"],
    description: "Apartemen 2BR full furnished dengan pemandangan kota. Akses mudah ke tol dan MRT, cocok untuk profesional muda.",
  },
  {
    owner: "rina", propertyType: "villa", city: "Denpasar", rentAmount: 12000000,
    bedrooms: 3, bathrooms: 3, area: 220, tourUrl: yt("1cjcaOAb8ts"),
    address: "Jl. Tukad Badung No. 21, Renon",
    amenities: ["WiFi", "AC", "Kolam Renang", "Dapur", "Taman", "Parkir"],
    images: ["1520250497591-112f2f40a3f4", "1582719508461-905c673771fd", "1540518614846-7eded433c457"],
    description: "Villa tropis tiga kamar dengan kolam renang pribadi. Tenang, hijau, dan 15 menit dari pantai Sanur.",
  },
  {
    owner: "rina", propertyType: "rumah", city: "Malang", rentAmount: 3800000,
    bedrooms: 3, bathrooms: 2, area: 140,
    address: "Jl. Ijen Boulevard No. 3, Klojen",
    amenities: ["WiFi", "Parkir", "Dapur", "Taman"],
    images: ["1576941089067-2de3c901e126", "1522708323590-d24dbb6b0267", "1595526114035-0d45ed16cfbf"],
    description: "Rumah klasik bergaya kolonial di boulevard Ijen. Langit-langit tinggi, halaman luas, cocok untuk keluarga.",
  },
  {
    owner: "rina", propertyType: "ruko", adType: "sale", city: "Surabaya", rentAmount: 2750000000,
    bedrooms: 0, bathrooms: 2, area: 180,
    address: "Jl. Raya Darmo Permai III No. 9",
    amenities: ["Parkir", "Listrik 5500 VA", "Keamanan 24 Jam", "AC"],
    images: ["1497366811353-6870744d04b2", "1497366216548-37526070297c"],
    description: "Ruko tiga lantai di jalur utama Darmo Permai, cocok untuk kantor atau usaha. Dijual, sertifikat SHM.",
  },
  {
    owner: "andi", propertyType: "kos", city: "Bandung", rentAmount: 1600000,
    bedrooms: 1, bathrooms: 1, area: 14,
    address: "Jl. Tubagus Ismail No. 21, Coblong",
    amenities: ["WiFi", "Kamar Mandi Dalam", "Laundry", "Dapur"],
    images: ["1522771739844-6a9f6d5f14af", "1493809842364-78817add7ffb"],
    description: "Kos campur yang bersih dan terang, jalan kaki ke kampus. Ada dapur bersama dan ruang santai di lantai atas.",
  },
  {
    owner: "andi", propertyType: "apartemen", city: "Jakarta Barat", rentAmount: 6200000,
    bedrooms: 1, bathrooms: 1, area: 42,
    address: "Jl. Puri Indah Raya Blok U1, Kembangan",
    amenities: ["WiFi", "AC", "Kolam Renang", "Keamanan 24 Jam"],
    images: ["1545324418-cc1a3fa10c00", "1554995207-c18c203602cb", "1484154218962-a197022b5858"],
    description: "Studio luas semi furnished dekat mal Puri Indah. Akses tol bandara hanya lima menit.",
  },
  {
    owner: "andi", propertyType: "rumah", city: "Bogor", rentAmount: 3500000,
    bedrooms: 3, bathrooms: 2, area: 120, tourUrl: yt("X79igBvmll4"),
    address: "Jl. Pajajaran Indah V No. 7, Baranangsiang",
    amenities: ["Parkir", "Taman", "Dapur", "Garasi"],
    images: ["1605276374104-dee2a0ed3cd6", "1560448204-e02f11c3d0e2", "1505693416388-ac5ce068fe85"],
    description: "Rumah keluarga di perumahan asri dengan udara sejuk khas Bogor. Dekat Kebun Raya dan stasiun.",
  },
  {
    owner: "rina", propertyType: "villa", city: "Badung", rentAmount: 18000000,
    bedrooms: 4, bathrooms: 4, area: 320, tourUrl: yt("7AY9Wiq9HYI"),
    address: "Jl. Pantai Berawa No. 88, Canggu",
    amenities: ["WiFi", "AC", "Kolam Renang", "Dapur", "Taman", "Parkir"],
    images: ["1613977257363-707ba9348227", "1613490493576-7fde63acd811", "1616594039964-ae9021a400a0"],
    description: "Villa dua lantai bergaya tropis modern, sepuluh menit jalan kaki ke Pantai Berawa. Cocok untuk keluarga atau kerja jarak jauh.",
  },
  {
    owner: "rina", propertyType: "kos", city: "Malang", rentAmount: 950000,
    bedrooms: 1, bathrooms: 1, area: 12,
    address: "Jl. Soekarno Hatta No. 45, Lowokwaru",
    amenities: ["WiFi", "Kamar Mandi Dalam", "Parkir"],
    images: ["1595526114035-0d45ed16cfbf", "1524758631624-e2822e304c36"],
    description: "Kos putri yang tenang dan aman dengan penjaga. Dekat kampus, minimarket, dan warung makan murah.",
  },
  {
    owner: "rina", propertyType: "apartemen", city: "Surabaya", rentAmount: 5500000,
    bedrooms: 1, bathrooms: 1, area: 48,
    address: "Jl. Mayjen Sungkono No. 89, Dukuh Pakis",
    amenities: ["WiFi", "AC", "Gym", "Kolam Renang", "Keamanan 24 Jam"],
    images: ["1460317442991-0ec209397118", "1600573472550-8090b5e0745e", "1556911220-bff31c812dba"],
    description: "Apartemen 1BR furnished dengan balkon menghadap kota. Satu gedung dengan pusat perbelanjaan.",
  },
  {
    owner: "maya", propertyType: "rumah", city: "Semarang", rentAmount: 3200000,
    bedrooms: 2, bathrooms: 1, area: 96, tourUrl: yt("HyX8x3D1xKo"),
    address: "Jl. Pandanaran II No. 10, Semarang Tengah",
    amenities: ["WiFi", "Parkir", "Dapur", "AC"],
    images: ["1600047509807-ba8f99d2cdde", "1586023492125-27b2c045efd7", "1540518614846-7eded433c457"],
    description: "Rumah minimalis di pusat kota, dekat Simpang Lima dan pusat oleh-oleh. Dua kamar tidur, satu kamar mandi.",
  },
  {
    owner: "maya", propertyType: "rumah", city: "Yogyakarta", rentAmount: 4200000,
    bedrooms: 3, bathrooms: 2, area: 130, tourUrl: yt("tMtQuxeynLM"),
    address: "Jl. Prawirotaman No. 12, Mergangsan",
    amenities: ["WiFi", "AC", "Taman", "Dapur", "Air Panas"],
    images: ["1583608205776-bfd35f0d9f83", "1617806118233-18e1de247200", "1522771739844-6a9f6d5f14af"],
    description: "Rumah dengan halaman tanaman tropis di kawasan Prawirotaman yang hidup dan penuh kafe.",
  },
  {
    owner: "maya", propertyType: "ruko", city: "Tangerang Selatan", rentAmount: 8500000,
    bedrooms: 0, bathrooms: 2, area: 160,
    address: "Jl. BSD Raya Utama Blok C No. 5, Serpong",
    amenities: ["Parkir", "AC", "Keamanan 24 Jam", "Listrik 5500 VA"],
    images: ["1555396273-367ea4eb4db5", "1441986300917-64674bd600d8"],
    description: "Ruko dua lantai di koridor bisnis BSD dengan arus pengunjung tinggi. Cocok untuk kafe atau klinik.",
  },
  {
    owner: "maya", propertyType: "apartemen", city: "Medan", rentAmount: 4800000,
    bedrooms: 2, bathrooms: 1, area: 56,
    address: "Jl. Gatot Subroto No. 30, Medan Petisah",
    amenities: ["WiFi", "AC", "Kolam Renang", "Parkir"],
    images: ["1574362848149-11496d93a7c7", "1567496898669-ee935f5f647a", "1631049307264-da0ec9d70304"],
    description: "Apartemen 2BR dengan pemandangan kota Medan. Dekat pusat kuliner dan rumah sakit.",
  },
  {
    owner: "maya", propertyType: "rumah", adType: "sale", city: "Depok", rentAmount: 1350000000,
    bedrooms: 3, bathrooms: 2, area: 110,
    address: "Jl. Margonda Raya Gg. Kenari No. 3, Beji",
    amenities: ["Parkir", "Taman", "Garasi", "Dapur"],
    images: ["1592595896551-12b371d546d5", "1600566753190-17f0baa2a6c3", "1595526114035-0d45ed16cfbf"],
    description: "Dijual rumah dua lantai, SHM, dekat kampus UI dan stasiun. Lingkungan tenang, bebas banjir.",
  },
  {
    owner: "maya", propertyType: "kos", city: "Solo", rentAmount: 1100000,
    bedrooms: 1, bathrooms: 1, area: 18,
    address: "Jl. Slamet Riyadi No. 210, Laweyan",
    amenities: ["WiFi", "AC", "Kamar Mandi Dalam", "Laundry"],
    images: ["1505693416388-ac5ce068fe85", "1586023492125-27b2c045efd7"],
    description: "Kos eksklusif di jalan utama Solo, dekat kawasan batik Laweyan. Kamar luas dengan jendela besar.",
  },
];

// ---------- Proses seed ----------
const clearSeedData = async () => {
  const seedUsers = await User.find({ email: new RegExp(`${SEED_DOMAIN.replace(".", "\\.")}$`) }).select("_id");
  const ids = seedUsers.map((u) => u._id);
  const props = await Property.find({ ownerId: { $in: ids } }).select("_id");
  const propIds = props.map((p) => p._id);

  await Promise.all([
    Message.deleteMany({ $or: [{ propertyId: { $in: propIds } }, { senderId: { $in: ids } }, { receiverId: { $in: ids } }] }),
    Booking.deleteMany({ $or: [{ propertyId: { $in: propIds } }, { renterId: { $in: ids } }] }),
    Property.deleteMany({ _id: { $in: propIds } }),
    User.deleteMany({ _id: { $in: ids } }),
  ]);
  // Hapus ilustrasi SVG dari versi seed lama (jika masih ada)
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.readdirSync(UPLOAD_DIR).filter((f) => f.startsWith("seed-")).forEach((f) => fs.unlinkSync(path.join(UPLOAD_DIR, f)));
  return ids.length;
};

const seed = async () => {
  await connectDB();

  // Pastikan semua index di schema benar-benar terbuat di Atlas
  await Promise.all([User, Property, Booking, Message].map((model) => model.syncIndexes()));

  const removed = await clearSeedData();
  if (removed) console.log(`Data seed lama dihapus (${removed} akun beserta datanya)`);

  // 1) Users. Password di-hash sekali lalu dipakai semua akun contoh
  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
  const users = {};
  for (const u of usersData) {
    users[u.key] = await User.create({
      name: u.name,
      email: `${u.email}${SEED_DOMAIN}`,
      password: hashedPassword,
      phone: u.phone,
      type: u.type,
      granted: "granted",
    });
  }

  // 2) Properties. Dibuat berurutan agar urutan "terbaru" (createdAt) mengikuti urutan data
  const props = [];
  for (const { owner: ownerKey, images, ...p } of propertiesData) {
    const owner = users[ownerKey];
    props.push(
      await Property.create({
        ...p,
        ownerId: owner._id,
        ownerContact: owner.phone,
        images: images.map(photo),
      })
    );
  }

  // 3) Bookings. Properti yang sudah "booked" ditandai tidak tersedia
  const bookingsData = [
    { property: 0, renter: "sari", status: "booked" },
    { property: 0, renter: "dimas", status: "rejected" },
    { property: 1, renter: "dimas", status: "pending" },
    { property: 3, renter: "sari", status: "pending" },
    { property: 4, renter: "dimas", status: "pending" },
    { property: 8, renter: "putri", status: "booked" },
    { property: 9, renter: "dimas", status: "rejected" },
    { property: 13, renter: "putri", status: "pending" },
    { property: 12, renter: "sari", status: "pending" },
  ];
  for (const b of bookingsData) {
    const property = props[b.property];
    const renter = users[b.renter];
    await Booking.create({
      propertyId: property._id,
      ownerId: property.ownerId,
      renterId: renter._id,
      renterName: renter.name,
      renterContact: renter.phone,
      bookingStatus: b.status,
    });
    if (b.status === "booked") await Property.updateOne({ _id: property._id }, { isAvailable: false });
  }

  // 4) Messages. Dibuat berurutan agar urutan waktu (createdAt) sesuai alur chat
  const messagesData = [
    { property: 0, from: "sari", to: "andi", read: true, text: "Halo Pak Andi, rumah di Dago masih tersedia? Boleh survei hari Sabtu?" },
    { property: 0, from: "andi", to: "sari", read: true, text: "Halo Mbak Sari, masih. Sabtu jam 10 pagi bisa, saya tunggu di lokasi." },
    { property: 0, from: "sari", to: "andi", read: false, text: "Siap Pak, terima kasih! Booking sudah saya ajukan juga." },
    { property: 1, from: "dimas", to: "andi", read: true, text: "Permisi, biaya kos sudah termasuk listrik?" },
    { property: 1, from: "andi", to: "dimas", read: false, text: "Sudah termasuk listrik, air, dan WiFi. Tinggal bawa barang saja." },
    { property: 3, from: "sari", to: "rina", read: false, text: "Bu Rina, villa-nya bisa disewa minimal 3 bulan?" },
    { property: 8, from: "putri", to: "andi", read: true, text: "Pak, rumah di Bogor boleh untuk keluarga dengan dua anak kecil?" },
    { property: 8, from: "andi", to: "putri", read: true, text: "Boleh sekali, Bu. Lingkungannya aman dan ada taman bermain di dekat rumah." },
    { property: 8, from: "putri", to: "andi", read: true, text: "Baik, saya ajukan booking ya Pak." },
    { property: 12, from: "sari", to: "maya", read: true, text: "Halo Bu Maya, rumah di Semarang sudah ada perabotnya?" },
    { property: 12, from: "maya", to: "sari", read: false, text: "Halo! Sudah ada kasur, lemari, dan meja makan. Tinggal bawa koper saja." },
    { property: 10, from: "dimas", to: "rina", read: false, text: "Kos putri di Malang masih ada kamar kosong untuk adik saya?" },
  ];
  for (const m of messagesData) {
    await Message.create({
      propertyId: props[m.property]._id,
      senderId: users[m.from]._id,
      receiverId: users[m.to]._id,
      text: m.text,
      isRead: m.read,
    });
  }

  // Ringkasan
  console.log("\nSeed selesai:");
  console.log(`  ${usersData.length} user, ${props.length} properti, ${bookingsData.length} booking, ${messagesData.length} pesan`);
  console.log(`\nAkun contoh (password semua: ${SEED_PASSWORD})`);
  console.table(usersData.map((u) => ({ role: u.type, nama: u.name, email: `${u.email}${SEED_DOMAIN}` })));
};

seed()
  .catch((error) => {
    console.error("Seed gagal:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
