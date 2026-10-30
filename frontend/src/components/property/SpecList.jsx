import Icon from "../common/Icon";

// Baris spesifikasi singkat: kamar tidur, kamar mandi, luas bangunan
export default function SpecList({ property }) {
  const { bedrooms, bathrooms, area } = property;
  if (!(bedrooms > 0 || bathrooms > 0 || area > 0)) return null;
  return (
    <ul className="specs">
      {bedrooms > 0 && <li title="Kamar tidur"><Icon name="bed" size={16} /> {bedrooms} KT</li>}
      {bathrooms > 0 && <li title="Kamar mandi"><Icon name="bath" size={16} /> {bathrooms} KM</li>}
      {area > 0 && <li title="Luas bangunan"><Icon name="area" size={16} /> {area} m²</li>}
    </ul>
  );
}
