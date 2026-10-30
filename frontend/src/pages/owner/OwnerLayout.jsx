import { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Icon from "../../components/common/Icon";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useUnread } from "../../context/UnreadContext";
import usePolling from "../../hooks/usePolling";

const LINKS = [
  { to: "/owner", label: "Ringkasan", icon: "grid", end: true },
  { to: "/owner/properties", label: "Properti saya", icon: "building" },
  { to: "/owner/bookings", label: "Booking masuk", icon: "calendar" },
  { to: "/owner/messages", label: "Pesan", icon: "message" },
];

// Tampilan saat akun owner belum/tidak disetujui admin
function ApprovalNotice({ status, onCheck, checking }) {
  const rejected = status === "rejected";
  return (
    <div className="hh-panel pending-box">
      <div className="empty__icon" style={rejected ? { background: "var(--accent-soft)", color: "var(--accent-ink)" } : undefined}>
        <Icon name={rejected ? "alert" : "clock"} size={28} />
      </div>
      <StatusBadge status={status} label={rejected ? "Ditolak admin" : "Menunggu persetujuan"} />
      <h2 className="mt-3 mb-2">{rejected ? "Pendaftaran owner ditolak" : "Akun kamu sedang ditinjau"}</h2>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: 440 }}>
        {rejected
          ? "Maaf, admin belum bisa menyetujui akun owner kamu. Hubungi admin HouseHunt untuk informasi lebih lanjut."
          : "Admin akan memverifikasi akunmu sebelum kamu bisa memasang properti. Halaman ini akan terbuka otomatis setelah disetujui."}
      </p>
      {!rejected && (
        <Button variant="outline-primary" onClick={onCheck} disabled={checking}>
          {checking && <Spinner size="sm" animation="border" />} Cek status sekarang
        </Button>
      )}
    </div>
  );
}

export default function OwnerLayout() {
  const { user, refreshUser } = useAuth();
  const { unread } = useUnread();
  const [checking, setChecking] = useState(false);
  const approved = user.granted === "granted";

  // Selama menunggu, status dicek otomatis tiap 20 detik
  usePolling(() => refreshUser().catch(() => {}), 20000, user.granted === "pending");

  const check = async () => {
    setChecking(true);
    await refreshUser().catch(() => {});
    setChecking(false);
  };

  const links = LINKS.map((l) => (l.icon === "message" ? { ...l, count: unread } : l));

  return (
    <DashboardLayout title="Dashboard Owner" links={approved ? links : links.slice(0, 1)}>
      {approved ? undefined : <ApprovalNotice status={user.granted} onCheck={check} checking={checking} />}
    </DashboardLayout>
  );
}
