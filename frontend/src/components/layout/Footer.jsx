import { MDBFooter } from "mdb-react-ui-kit";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Brand } from "./AppNavbar";

const YEAR = new Date().getFullYear();
const CITIES = ["Bandung", "Yogyakarta", "Jakarta Selatan", "Denpasar", "Surabaya"];

// Footer (MDB Footer) dengan tautan untuk penyewa, pemilik, dan kota populer
export default function Footer() {
  return (
    <MDBFooter className="hh-footer">
      <Container>
        <div className="footer-grid">
          <div>
            <span className="brand"><Brand /></span>
            <p className="mt-2 mb-0" style={{ maxWidth: 300 }}>
              Platform sewa properti yang menghubungkan pemilik dan penyewa secara langsung.
            </p>
          </div>
          <nav className="footer-col" aria-label="Untuk penyewa">
            <h3>Penyewa</h3>
            <ul>
              <li><Link to="/properties">Cari properti</Link></li>
              <li><Link to="/insights">Harga pasar</Link></li>
              <li><Link to="/register">Buat akun</Link></li>
            </ul>
          </nav>
          <nav className="footer-col" aria-label="Untuk pemilik">
            <h3>Pemilik</h3>
            <ul>
              <li><Link to="/register?role=owner">Pasang properti</Link></li>
              <li><Link to="/login">Masuk ke dashboard</Link></li>
            </ul>
          </nav>
          <nav className="footer-col" aria-label="Kota populer">
            <h3>Kota populer</h3>
            <ul>
              {CITIES.map((city) => (
                <li key={city}><Link to={`/properties?city=${encodeURIComponent(city)}`}>{city}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {YEAR} HouseHunt</span>
          <span>
            Foto contoh dari <a href="https://unsplash.com" target="_blank" rel="noreferrer">Unsplash</a>
          </span>
        </div>
      </Container>
    </MDBFooter>
  );
}
