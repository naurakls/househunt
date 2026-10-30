import moment from "moment";
// Penting: pakai versi "dist" agar locale terdaftar di instance moment yang sama dengan yang di-bundle Vite
import "moment/dist/locale/id";
import { API_URL } from "../api/axios";

// Semua tanggal tampil dalam Bahasa Indonesia ("16 Okt 2026", "3 jam yang lalu")
moment.locale("id");

export const PROPERTY_TYPES = [
  { value: "rumah", label: "Rumah" },
  { value: "apartemen", label: "Apartemen" },
  { value: "kos", label: "Kos" },
  { value: "villa", label: "Villa" },
  { value: "ruko", label: "Ruko" },
];

export const AMENITY_OPTIONS = [
  "WiFi", "AC", "Parkir", "Dapur", "Kamar Mandi Dalam", "Laundry",
  "Kolam Renang", "Taman", "Gym", "Keamanan 24 Jam", "Air Panas",
];

export const typeLabel = (value) => PROPERTY_TYPES.find((t) => t.value === value)?.label || value;
export const propertyTitle = (property) => `${typeLabel(property.propertyType)} di ${property.city}`;

// ---------- Harga ----------
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 2 });

export const formatRupiah = (amount) => rupiah.format(amount || 0);
// Format ringkas untuk grafik & ringkasan: "Rp4,5 jt", "Rp2,75 M"
export const formatRupiahShort = (amount) => `Rp${compact.format(amount || 0)}`;
// Properti dijual memakai format ringkas: "Rp2,75 M"
export const formatPrice = (amount, adType) =>
  adType === "sale" ? `Rp ${compact.format(amount || 0)}` : formatRupiah(amount);
export const priceSuffix = (adType) => (adType === "sale" ? "" : "/bulan");

// ---------- Tanggal (Moment) ----------
export const formatDate = (date) => moment(date).format("D MMM YYYY");
export const formatDateTime = (date) => moment(date).format("D MMM YYYY, HH:mm");
export const fromNow = (date) => moment(date).fromNow();
export const chatTime = (date) => {
  const m = moment(date);
  return m.isSame(moment(), "day") ? m.format("HH:mm") : m.format("D MMM");
};
export const dayLabel = (date) =>
  moment(date).calendar(null, {
    sameDay: "[Hari ini]",
    lastDay: "[Kemarin]",
    lastWeek: "dddd",
    sameElse: "D MMMM YYYY",
  });
export const isSameDay = (a, b) => moment(a).isSame(moment(b), "day");

// ---------- Gambar ----------
export const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#EFECE6"/><path d="M150 190v-55l50-38 50 38v55z" fill="none" stroke="#CFC8BC" stroke-width="8" stroke-linejoin="round"/></svg>'
)}`;
// path bisa berupa file upload ("uploads/x.jpg") atau URL foto Unsplash.
// Untuk Unsplash, lebar gambar diminta sesuai kebutuhan supaya halaman tetap ringan.
export const imageUrl = (path, width = 800) => {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith("https://images.unsplash.com/")) return `${path}?w=${width}&q=75&auto=format&fit=crop`;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}/${path}`;
};

// Spesifikasi singkat: "3 KT · 2 KM · 120 m²" (bagian yang kosong dilewati)
export const specParts = (p) =>
  [
    p.bedrooms > 0 && `${p.bedrooms} KT`,
    p.bathrooms > 0 && `${p.bathrooms} KM`,
    p.area > 0 && `${p.area} m²`,
  ].filter(Boolean);

// Mengambil ID video dari link YouTube untuk embed virtual tour
export const youtubeId = (url = "") => url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1] || null;

// Menghapus field kosong sebelum dikirim sebagai query string
export const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined));
