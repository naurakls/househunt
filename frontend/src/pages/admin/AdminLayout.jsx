import DashboardLayout from "../../components/layout/DashboardLayout";

export default function AdminLayout() {
  return (
    <DashboardLayout
      title="Dashboard Admin"
      links={[
        { to: "/admin", label: "Ringkasan", icon: "grid", end: true },
        { to: "/admin/users", label: "Kelola user", icon: "users" },
        { to: "/admin/properties", label: "Semua properti", icon: "building" },
        { to: "/admin/bookings", label: "Semua booking", icon: "calendar" },
      ]}
    />
  );
}
