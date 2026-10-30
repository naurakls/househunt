import { Suspense } from "react";
import { Container } from "react-bootstrap";
import { NavLink, Outlet } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Icon from "../common/Icon";
import PageLoader from "../common/PageLoader";
import { useAuth } from "../../context/AuthContext";

// Kerangka dashboard: sidebar sederhana (desktop) / tab horizontal (HP) + konten.
// links: [{ to, label, icon, end, count }]
export default function DashboardLayout({ title, links, children }) {
  const { user } = useAuth();

  return (
    <Container>
      <div className="dash">
        <aside className="dash__sidebar">
          <p className="dash__title">{title}</p>
          <nav className="dash__nav" aria-label={title}>
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className="dash__link">
                <Icon name={link.icon} size={19} />
                {link.label}
                {link.count > 0 && <span className="dash__count">{link.count}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="dash__user">
            <Avatar sx={{ width: 38, height: 38, fontSize: 15 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
            <div className="min-w-0">
              <div className="dash__user-name">{user.name}</div>
              <div className="dash__user-email">{user.email}</div>
            </div>
          </div>
        </aside>

        <section className="dash__content">
          {children || (
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          )}
        </section>
      </div>
    </Container>
  );
}
