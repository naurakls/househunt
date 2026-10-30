import { Link } from "react-router-dom";
import BarList from "../insights/BarList";
import { formatRupiahShort, typeLabel } from "../../utils/format";

// Market insight di halaman detail: harga properti ini dibanding rata-rata properti sejenis
export default function MarketBox({ property }) {
  const market = property.market;
  if (!market) return null;

  const type = typeLabel(property.propertyType).toLowerCase();
  const scope = market.scope === "city" ? `${type} di ${property.city}` : `${type} di semua kota`;
  const diff = market.diffPercent;
  const verdict =
    Math.abs(diff) <= 2 ? "setara dengan" : `${Math.abs(diff)}% ${diff < 0 ? "lebih murah dari" : "lebih mahal dari"}`;

  return (
    <div className="hh-panel market-box">
      <h3>Perbandingan harga</h3>
      <p className="market-box__verdict">
        Harga ini <strong>{verdict}</strong> rata-rata {scope} ({market.count} listing lain).
      </p>
      <BarList
        ariaLabel="Harga properti ini dibanding rata-rata"
        rows={[
          { key: "this", label: "Properti ini", value: property.rentAmount, valueLabel: formatRupiahShort(property.rentAmount) },
          { key: "avg", label: "Rata-rata", value: market.average, valueLabel: formatRupiahShort(market.average), muted: true },
        ]}
      />
      <Link
        to={market.scope === "city" ? `/insights?city=${encodeURIComponent(property.city)}` : "/insights"}
        className="link-arrow mt-3 small"
      >
        Lihat data pasar {market.scope === "city" ? property.city : ""}
      </Link>
    </div>
  );
}
