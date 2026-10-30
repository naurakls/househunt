import { Navigate, useLocation } from "react-router-dom";
import { dashboardPath, useAuth } from "../../context/AuthContext";

// Melindungi halaman berdasarkan role.
// Belum login -> ke /login (lalu kembali ke halaman ini setelah login).
// Role tidak sesuai -> dikembalikan ke dashboard miliknya.
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.type)) return <Navigate to={dashboardPath(user)} replace />;
  return children;
}

// Halaman login/register tidak perlu dibuka lagi jika sudah login
export function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={dashboardPath(user)} replace />;
  return children;
}
