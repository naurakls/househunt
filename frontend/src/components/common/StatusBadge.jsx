// Badge status dengan warna lembut. tone: ok (sage), accent (terracotta), warn (kuning), neutral
const STATUS = {
  available: ["Tersedia", "ok"],
  rented: ["Disewa", "accent"],
  sold: ["Terjual", "accent"],
  sale: ["Dijual", "neutral"],
  pending: ["Menunggu", "warn"],
  booked: ["Disetujui", "ok"],
  rejected: ["Ditolak", "accent"],
  granted: ["Disetujui", "ok"],
  renter: ["Renter", "neutral"],
  owner: ["Owner", "neutral"],
  admin: ["Admin", "ok"],
};

export default function StatusBadge({ status, label, plain = false }) {
  const [text, tone] = STATUS[status] || [status, "neutral"];
  return <span className={`hh-badge hh-badge--${tone}${plain ? " hh-badge--plain" : ""}`}>{label || text}</span>;
}
