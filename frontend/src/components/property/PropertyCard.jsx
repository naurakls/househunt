import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import SafeImage from "../common/SafeImage";
import StatusBadge from "../common/StatusBadge";
import SpecList from "./SpecList";
import { formatPrice, priceSuffix, propertyTitle } from "../../utils/format";

// Kartu properti reusable: foto 4:3, badge status, harga tebal, spesifikasi, chip fasilitas.
// footer (opsional) dipakai dashboard owner untuk tombol Edit/Hapus.
export default function PropertyCard({ property, footer }) {
  const { _id, images, isAvailable, adType, rentAmount, address, amenities = [], tourUrl } = property;
  const visibleAmenities = amenities.slice(0, 3);
  const hiddenCount = amenities.length - visibleAmenities.length;
  const status = isAvailable ? "available" : adType === "sale" ? "sold" : "rented";

  return (
    <article className="hh-card hh-card--hover property-card">
      <Link to={`/properties/${_id}`} className="property-card__link">
        <div className="property-card__media">
          <SafeImage path={images?.[0]} alt={propertyTitle(property)} width={720} />
          <div className="property-card__badges">
            <StatusBadge status={status} />
            {adType === "sale" && <StatusBadge status="sale" />}
          </div>
          {tourUrl && (
            <span className="property-card__tour">
              <Icon name="play" size={14} /> Video tour
            </span>
          )}
        </div>

        <div className="property-card__body">
          <div className="price">
            {formatPrice(rentAmount, adType)}
            <small>{priceSuffix(adType)}</small>
          </div>
          <h3 className="property-card__title">{propertyTitle(property)}</h3>
          <p className="property-card__address">
            <Icon name="mapPin" size={15} />
            <span>{address}</span>
          </p>
          <SpecList property={property} />
          {visibleAmenities.length > 0 && (
            <div className="chip-row">
              {visibleAmenities.map((item) => (
                <span className="chip" key={item}>{item}</span>
              ))}
              {hiddenCount > 0 && <span className="chip chip--more">+{hiddenCount}</span>}
            </div>
          )}
        </div>
      </Link>
      {footer && <div className="property-card__footer">{footer}</div>}
    </article>
  );
}
