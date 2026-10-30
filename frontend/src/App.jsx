import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute, { GuestRoute } from "./components/routing/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";

// Halaman dashboard di-load terpisah (code splitting) agar halaman publik lebih ringan
const Insights = lazy(() => import("./pages/Insights"));
const Messages = lazy(() => import("./pages/Messages"));
const DashboardMessages = lazy(() => import("./pages/DashboardMessages"));
const RenterLayout = lazy(() => import("./pages/renter/RenterLayout"));
const RenterBookings = lazy(() => import("./pages/renter/RenterBookings"));
const OwnerLayout = lazy(() => import("./pages/owner/OwnerLayout"));
const OwnerOverview = lazy(() => import("./pages/owner/OwnerOverview"));
const OwnerProperties = lazy(() => import("./pages/owner/OwnerProperties"));
const OwnerBookings = lazy(() => import("./pages/owner/OwnerBookings"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Publik */}
        <Route index element={<Home />} />
        <Route path="properties" element={<Properties />} />
        <Route path="properties/:id" element={<PropertyDetail />} />
        <Route path="insights" element={<Insights />} />
        <Route path="login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Renter & owner */}
        <Route
          path="messages"
          element={<ProtectedRoute roles={["renter", "owner"]}><Messages /></ProtectedRoute>}
        />

        {/* Dashboard per role (protected route berdasarkan role) */}
        <Route path="renter" element={<ProtectedRoute roles={["renter"]}><RenterLayout /></ProtectedRoute>}>
          <Route index element={<RenterBookings />} />
          <Route path="messages" element={<DashboardMessages />} />
        </Route>

        <Route path="owner" element={<ProtectedRoute roles={["owner"]}><OwnerLayout /></ProtectedRoute>}>
          <Route index element={<OwnerOverview />} />
          <Route path="properties" element={<OwnerProperties />} />
          <Route path="bookings" element={<OwnerBookings />} />
          <Route path="messages" element={<DashboardMessages />} />
        </Route>

        <Route path="admin" element={<ProtectedRoute roles={["admin"]}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
