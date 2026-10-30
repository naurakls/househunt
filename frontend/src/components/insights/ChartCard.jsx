import { useState } from "react";
import { Segmented } from "antd";

// Kartu grafik dengan pilihan tampilan Grafik / Tabel (data yang sama, untuk aksesibilitas)
export default function ChartCard({ title, subtitle, chart, table, footnote }) {
  const [view, setView] = useState("chart");
  return (
    <section className="hh-panel insight-card">
      <div className="hh-panel__head align-items-start">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <Segmented
          size="small"
          value={view}
          onChange={setView}
          options={[
            { label: "Grafik", value: "chart" },
            { label: "Tabel", value: "table" },
          ]}
        />
      </div>
      {view === "chart" ? chart : table}
      {footnote && <p className="insight-card__foot">{footnote}</p>}
    </section>
  );
}
