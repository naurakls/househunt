import { Container, Form } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import EmptyState from "../components/common/EmptyState";
import BarList from "../components/insights/BarList";
import ChartCard from "../components/insights/ChartCard";
import api from "../api/axios";
import useApi from "../hooks/useApi";
import { formatRupiah, formatRupiahShort, typeLabel } from "../utils/format";

const bucketLabel = ({ from, to }) => {
  if (!from) return `Di bawah ${formatRupiahShort(to)}`;
  if (!to) return `Di atas ${formatRupiahShort(from)}`;
  return `${formatRupiahShort(from)} – ${formatRupiahShort(to)}`;
};

// Tabel sederhana untuk tampilan "Tabel" di setiap kartu grafik
function DataTable({ columns, rows }) {
  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key} className={c.num ? "num" : ""}>{c.title}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{columns.map((c) => <td key={c.key} className={c.num ? "num" : ""}>{c.render(row)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Halaman Market Insights: gambaran harga sewa dari seluruh listing
export default function Insights() {
  const [params, setParams] = useSearchParams();
  const city = params.get("city") || "";
  const cities = useApi(() => api.get("/users/cities"), []);
  const { data, loading, error } = useApi(() => api.get("/users/insights", { params: city ? { city } : {} }), [city]);

  const changeCity = (value) => setParams(value ? { city: value } : {});
  const s = data?.summary;
  const scope = city ? `di ${city}` : "di semua kota";

  return (
    <Container className="py-4 py-lg-5">
      <PageHeader
        title="Harga pasar sewa"
        subtitle="Gambaran harga sewa per bulan dari listing yang ada di HouseHunt. Data diperbarui otomatis setiap ada listing baru."
      />

      {/* Filter: satu baris di atas semua grafik, berlaku untuk seluruh halaman */}
      <div className="insight-filter">
        <Form.Select value={city} onChange={(e) => changeCity(e.target.value)} aria-label="Pilih kota">
          <option value="">Semua kota</option>
          {(cities.data || []).map((c) => (
            <option key={c.city} value={c.city}>{c.city}</option>
          ))}
        </Form.Select>
        <span className="text-muted small">Hanya listing berstatus disewakan yang dihitung. Properti dijual tidak dicampur.</span>
      </div>

      {error && <EmptyState icon="alert" title="Data pasar tidak bisa dimuat" text={error} />}

      {!error && !data && (
        <div className="insight-grid">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={280} />)}
        </div>
      )}

      {data && s.count === 0 && (
        <EmptyState
          icon="chart"
          title={`Belum ada listing sewa ${scope}`}
          text="Coba pilih kota lain."
          action={<button type="button" className="btn btn-outline-primary" onClick={() => changeCity("")}>Lihat semua kota</button>}
        />
      )}

      {data && s.count > 0 && (
        <div className={loading ? "is-refetching" : ""}>
          <div className="stat-grid">
            <StatCard label="Median sewa per bulan" value={formatRupiahShort(s.median)} hint={`Separuh listing ${scope} di bawah angka ini`} icon="chart" />
            <StatCard label="Rata-rata sewa" value={formatRupiahShort(s.average)} hint={formatRupiah(s.average)} icon="home" />
            <StatCard label="Listing sewa" value={s.count} hint={`${s.newThisMonth} baru dalam 30 hari`} icon="building" />
            <StatCard label="Masih tersedia" value={`${s.availableRate}%`} hint="Sisanya sudah disewa" icon="check" />
          </div>

          <div className="insight-grid">
            {!city && (
              <ChartCard
                title="Rata-rata sewa per kota"
                subtitle="Diurutkan dari yang termahal"
                footnote="Kota dengan sedikit listing bisa berubah banyak saat ada listing baru."
                chart={
                  <BarList
                    ariaLabel="Rata-rata sewa per kota"
                    rows={data.byCity.map((c) => ({
                      key: c.city,
                      label: c.city,
                      value: c.average,
                      valueLabel: formatRupiahShort(c.average),
                      details: [`${c.count} listing · ${c.available} tersedia`, `Rentang ${formatRupiahShort(c.min)} – ${formatRupiahShort(c.max)}`],
                    }))}
                  />
                }
                table={
                  <DataTable
                    rows={data.byCity}
                    columns={[
                      { key: "city", title: "Kota", render: (r) => <Link to={`/properties?city=${encodeURIComponent(r.city)}`}>{r.city}</Link> },
                      { key: "avg", title: "Rata-rata", num: true, render: (r) => formatRupiah(r.average) },
                      { key: "range", title: "Rentang", num: true, render: (r) => `${formatRupiahShort(r.min)} – ${formatRupiahShort(r.max)}` },
                      { key: "count", title: "Listing", num: true, render: (r) => r.count },
                    ]}
                  />
                }
              />
            )}

            <ChartCard
              title="Rata-rata sewa per tipe properti"
              subtitle={`Harga per bulan ${scope}`}
              chart={
                <BarList
                  ariaLabel="Rata-rata sewa per tipe properti"
                  rows={data.byType.map((t) => ({
                    key: t.type,
                    label: typeLabel(t.type),
                    value: t.average,
                    valueLabel: formatRupiahShort(t.average),
                    details: [
                      `${t.count} listing`,
                      `Rentang ${formatRupiahShort(t.min)} – ${formatRupiahShort(t.max)}`,
                      ...(t.perM2 ? [`± ${formatRupiah(t.perM2)} per m²`] : []),
                    ],
                  }))}
                />
              }
              table={
                <DataTable
                  rows={data.byType}
                  columns={[
                    { key: "type", title: "Tipe", render: (r) => typeLabel(r.type) },
                    { key: "avg", title: "Rata-rata", num: true, render: (r) => formatRupiah(r.average) },
                    { key: "m2", title: "Per m²", num: true, render: (r) => (r.perM2 ? formatRupiah(r.perM2) : "-") },
                    { key: "count", title: "Listing", num: true, render: (r) => r.count },
                  ]}
                />
              }
            />

            <ChartCard
              title="Sebaran harga sewa"
              subtitle="Jumlah listing per rentang harga bulanan"
              chart={
                <BarList
                  ariaLabel="Jumlah listing per rentang harga"
                  rows={data.distribution.map((b) => ({
                    key: b.from,
                    label: bucketLabel(b),
                    value: b.count,
                    valueLabel: `${b.count} listing`,
                    details: [`${s.count ? Math.round((b.count / s.count) * 100) : 0}% dari semua listing sewa ${scope}`],
                  }))}
                />
              }
              table={
                <DataTable
                  rows={data.distribution}
                  columns={[
                    { key: "range", title: "Rentang harga", render: (r) => bucketLabel(r) },
                    { key: "count", title: "Listing", num: true, render: (r) => r.count },
                  ]}
                />
              }
            />

            <ChartCard
              title="Fasilitas yang paling sering ada"
              subtitle="Persentase listing yang memilikinya"
              chart={
                <BarList
                  ariaLabel="Fasilitas paling umum"
                  rows={data.amenities.map((a) => ({
                    key: a.name,
                    label: a.name,
                    value: a.share,
                    valueLabel: `${a.share}%`,
                    details: [`${a.count} dari ${s.count} listing`],
                  }))}
                />
              }
              table={
                <DataTable
                  rows={data.amenities}
                  columns={[
                    { key: "name", title: "Fasilitas", render: (r) => r.name },
                    { key: "share", title: "Persentase", num: true, render: (r) => `${r.share}%` },
                    { key: "count", title: "Listing", num: true, render: (r) => r.count },
                  ]}
                />
              }
            />
          </div>
        </div>
      )}
    </Container>
  );
}
