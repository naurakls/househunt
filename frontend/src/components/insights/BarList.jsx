import { useState } from "react";

// Grafik batang horizontal sederhana (tanpa library chart).
// rows: [{ key, label, value, valueLabel, details?: string[], muted?: boolean }]
// Nilai ditulis di ujung batang; detail tambahan muncul di tooltip saat hover / fokus keyboard.
const MAX_BAR = 78; // lebar batang terpanjang (% dari area), sisanya untuk label nilai

export default function BarList({ rows, ariaLabel }) {
  const [active, setActive] = useState(null);
  const top = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ul className="bar-list" aria-label={ariaLabel}>
      {rows.map((row) => {
        const width = Math.max(0.5, (row.value / top) * MAX_BAR);
        const hasDetails = row.details?.length > 0;
        return (
          <li
            key={row.key}
            className="bar-row"
            tabIndex={hasDetails ? 0 : undefined}
            onMouseEnter={() => setActive(row.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(row.key)}
            onBlur={() => setActive(null)}
            aria-label={[`${row.label}: ${row.valueLabel}`, ...(row.details || [])].join(", ")}
          >
            <span className="bar-row__label" title={row.label}>{row.label}</span>
            <span className="bar-row__track" style={{ position: "relative" }}>
              <span className={`bar-row__bar${row.muted ? " bar-row__bar--muted" : ""}`} style={{ width: `${width}%` }} />
              <span className="bar-row__value">{row.valueLabel}</span>
              {active === row.key && hasDetails && (
                <span className="bar-tooltip" role="tooltip" style={{ "--x": `${Math.min(width, 60)}%` }}>
                  <strong>{row.valueLabel}</strong>
                  {row.label}
                  {row.details.map((d) => (
                    <span key={d} className="d-block">{d}</span>
                  ))}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
