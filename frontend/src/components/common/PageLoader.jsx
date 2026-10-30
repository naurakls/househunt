import { Spinner } from "react-bootstrap";

// Fallback saat halaman (lazy-loaded) sedang diunduh
export default function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner animation="border" role="status" aria-label="Memuat" />
    </div>
  );
}
