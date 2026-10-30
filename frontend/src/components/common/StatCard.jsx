import { MDBCard, MDBCardBody } from "mdb-react-ui-kit";
import Skeleton from "@mui/material/Skeleton";
import Icon from "./Icon";

// Kartu angka ringkasan di dashboard (MDB Card + MUI Skeleton saat memuat)
export default function StatCard({ label, value, hint, icon = "grid", tone, loading = false }) {
  return (
    <MDBCard className="stat-card">
      <MDBCardBody>
        <div className="stat-card__label">
          <span>{label}</span>
          <span className={`stat-card__icon${tone ? ` stat-card__icon--${tone}` : ""}`}>
            <Icon name={icon} size={18} />
          </span>
        </div>
        <div className="stat-card__value">
          {loading ? <Skeleton variant="text" width={56} height={44} /> : value}
        </div>
        {hint && <div className="stat-card__hint">{hint}</div>}
      </MDBCardBody>
    </MDBCard>
  );
}
