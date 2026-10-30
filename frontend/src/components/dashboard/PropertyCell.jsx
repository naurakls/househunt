import { Link } from "react-router-dom";
import SafeImage from "../common/SafeImage";
import { propertyTitle } from "../../utils/format";

// Sel tabel berisi thumbnail + judul + alamat properti
export default function PropertyCell({ property }) {
  if (!property) return <span className="cell-sub">Properti sudah dihapus</span>;
  return (
    <div className="cell-property">
      <SafeImage path={property.images?.[0]} alt="" />
      <div>
        <Link to={`/properties/${property._id}`} className="cell-property__title">
          {propertyTitle(property)}
        </Link>
        <div className="cell-sub">{property.address}</div>
      </div>
    </div>
  );
}
