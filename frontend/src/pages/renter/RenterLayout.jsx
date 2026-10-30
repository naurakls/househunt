import DashboardLayout from "../../components/layout/DashboardLayout";
import { useUnread } from "../../context/UnreadContext";

export default function RenterLayout() {
  const { unread } = useUnread();
  return (
    <DashboardLayout
      title="Dashboard Renter"
      links={[
        { to: "/renter", label: "Booking saya", icon: "calendar", end: true },
        { to: "/renter/messages", label: "Pesan", icon: "message", count: unread },
        { to: "/properties", label: "Cari properti", icon: "search" },
      ]}
    />
  );
}
