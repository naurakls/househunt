import { startTransition } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Icon from "../common/Icon";
import { dashboardPath, useAuth } from "../../context/AuthContext";
import { useUnread } from "../../context/UnreadContext";
import useNotify from "../../hooks/useNotify";

const ROLE_LABEL = { renter: "Renter", owner: "Owner", admin: "Admin" };

export function Brand() {
  return (
    <>
      <span className="brand__mark"><Icon name="home" size={17} strokeWidth={2} /></span>
      <span>House<em>Hunt</em></span>
    </>
  );
}

// Navbar dinamis: menu berubah sesuai status login & role user
export default function AppNavbar() {
  const { user, logout } = useAuth();
  const { unread } = useUnread();
  const navigate = useNavigate();
  const notify = useNotify();

  const handleLogout = (e) => {
    e.preventDefault();
    // Pindah halaman & hapus sesi dalam satu transition agar dirender bersamaan.
    // Tanpa ini, ProtectedRoute di dashboard sempat melempar user ke /login.
    startTransition(() => {
      navigate("/");
      logout();
    });
    notify.success("Kamu sudah keluar. Sampai jumpa!");
  };

  return (
    <Navbar expand="lg" sticky="top" className="hh-navbar" collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand">
          <Brand />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto ms-lg-4">
            <Nav.Link as={NavLink} to="/properties" eventKey="properties">
              Cari Properti
            </Nav.Link>
            <Nav.Link as={NavLink} to="/insights" eventKey="insights">
              Harga Pasar
            </Nav.Link>
          </Nav>

          <Nav className="align-items-lg-center gap-lg-1">
            {!user && (
              <>
                <Nav.Link as={NavLink} to="/login" eventKey="login">Masuk</Nav.Link>
                <Link to="/register" className="btn btn-primary nav-cta ms-lg-2">Daftar</Link>
              </>
            )}

            {user && (
              <>
                <Nav.Link as={NavLink} to={dashboardPath(user)} eventKey="dashboard">
                  <Icon name="grid" size={18} /> Dashboard
                </Nav.Link>
                {user.type !== "admin" && (
                  <Nav.Link as={NavLink} to="/messages" eventKey="messages">
                    <Badge badgeContent={unread} color="secondary" max={99} className="nav-badge">
                      <Icon name="message" size={18} />
                    </Badge>
                    Pesan
                  </Nav.Link>
                )}
                <NavDropdown
                  align="end"
                  className="ms-lg-2"
                  title={
                    <span className="nav-user">
                      <Avatar sx={{ width: 34, height: 34, fontSize: 14 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
                      <span className="text-start lh-sm">
                        <span className="nav-user__name d-block">{user.name.split(" ")[0]}</span>
                        <span className="nav-user__role d-block">{ROLE_LABEL[user.type]}</span>
                      </span>
                    </span>
                  }
                >
                  <NavDropdown.Header className="small">{user.email}</NavDropdown.Header>
                  <NavDropdown.Item as={Link} to={dashboardPath(user)}>
                    <Icon name="grid" size={16} className="me-2" /> Dashboard
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <Icon name="logout" size={16} className="me-2" /> Keluar
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
