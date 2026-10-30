import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";

export default function NotFound() {
  return (
    <Container className="py-5">
      <EmptyState
        icon="home"
        title="Halaman tidak ditemukan"
        text="Sepertinya alamat ini salah ketik, atau halamannya sudah pindah."
        action={<Link to="/" className="btn btn-primary">Kembali ke beranda</Link>}
      />
    </Container>
  );
}
