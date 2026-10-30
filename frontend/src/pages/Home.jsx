import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import Icon from "../components/common/Icon";
import SafeImage from "../components/common/SafeImage";
import SearchBar from "../components/property/SearchBar";
import PropertyGrid from "../components/property/PropertyGrid";
import BarList from "../components/insights/BarList";
import api from "../api/axios";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { formatPrice, formatRupiahShort, priceSuffix, propertyTitle, specParts } from "../utils/format";

export default function Home() {
  const { user } = useAuth();
  const latest = useApi(() => api.get("/users/properties", { params: { limit: 6 } }), []);
  const cities = useApi(() => api.get("/users/cities"), []);
  const insights = useApi(() => api.get("/users/insights"), []);

  const items = latest.data?.items || [];
  const cityList = cities.data || [];
  const totalListings = cityList.reduce((sum, c) => sum + c.total, 0);
  // Foto hero: rumah/villa sewa terbaru yang masih tersedia (foto tampak luar)
  const featured =
    items.find((p) => p.adType === "rent" && p.isAvailable && ["rumah", "villa"].includes(p.propertyType)) || items[0];
  const topCities = (insights.data?.byCity || []).slice().sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <>
      {/* Hero: foto properti asli + kotak pencarian */}
      <section className="hero">
        <Container>
          <div className="hero__grid">
            <div>
              <h1 className="hero__title">Sewa rumah, kos, dan apartemen langsung dari pemiliknya.</h1>
              <p className="hero__lead">
                {cities.loading
                  ? "Tanya pemilik lewat chat, ajukan sewa, dan pantau statusnya tanpa biaya perantara."
                  : `${totalListings} listing di ${cityList.length} kota. Tanya pemilik lewat chat, ajukan sewa, dan pantau statusnya tanpa biaya perantara.`}
              </p>
              <div className="hero__popular">
                <span>Sering dicari:</span>
                <Link to="/properties?propertyType=kos">Kos</Link>
                <Link to="/properties?propertyType=apartemen">Apartemen</Link>
                {cityList.slice(0, 3).map((c) => (
                  <Link key={c.city} to={`/properties?city=${encodeURIComponent(c.city)}`}>{c.city}</Link>
                ))}
              </div>
            </div>

            <figure className="hero__photo">
              {featured ? (
                <>
                  <SafeImage path={featured.images?.[0]} alt={propertyTitle(featured)} width={1400} loading="eager" />
                  <Link to={`/properties/${featured._id}`} className="hero__listing">
                    <SafeImage path={featured.images?.[1] || featured.images?.[0]} alt="" width={160} />
                    <span>
                      <span className="hero__listing-title">{propertyTitle(featured)}</span>
                      <span className="hero__listing-meta">
                        {formatPrice(featured.rentAmount, featured.adType)}
                        {priceSuffix(featured.adType)}
                        {specParts(featured).length > 0 && ` · ${specParts(featured).join(" · ")}`}
                      </span>
                    </span>
                  </Link>
                </>
              ) : (
                <Skeleton variant="rectangular" sx={{ width: "100%", height: "100%" }} />
              )}
            </figure>
          </div>

          <div className="hero__search">
            <SearchBar />
          </div>
        </Container>
      </section>

      {/* Properti terbaru */}
      <section className="section">
        <Container>
          <div className="section-head">
            <div>
              <h2 className="section-title">Baru dipasang</h2>
              <p className="section-sub">Listing terbaru dari pemilik yang sudah diverifikasi admin.</p>
            </div>
            <Link to="/properties" className="link-arrow">
              Lihat semua <Icon name="arrowRight" size={18} />
            </Link>
          </div>
          <PropertyGrid
            items={latest.data?.items}
            loading={latest.loading}
            emptyTitle="Belum ada properti"
            emptyText="Properti yang dipasang pemilik akan muncul di sini."
          />
        </Container>
      </section>

      {/* Per kota */}
      {(cities.loading || cityList.length > 0) && (
        <section className="section pt-0">
          <Container>
            <div className="section-head">
              <div>
                <h2 className="section-title">Cari berdasarkan kota</h2>
                <p className="section-sub">Jumlah listing yang masih tersedia di tiap kota.</p>
              </div>
            </div>
            <div className="city-grid">
              {cities.loading
                ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="rounded" height={86} />)
                : cityList.slice(0, 8).map((c) => (
                    <Link
                      key={c.city}
                      to={`/properties?city=${encodeURIComponent(c.city)}`}
                      className="city-tile hh-card hh-card--hover"
                    >
                      <SafeImage path={c.image} alt="" width={160} loading="eager" />
                      <span className="city-tile__body">
                        <span className="city-tile__name">{c.city}</span>
                        <span className="city-tile__meta">
                          {c.available > 0 ? `${c.available} dari ${c.total} tersedia` : `${c.total} properti, semua tersewa`}
                        </span>
                      </span>
                      <Icon name="arrowRight" size={18} className="city-tile__arrow" />
                    </Link>
                  ))}
            </div>
          </Container>
        </section>
      )}

      {/* Ringkasan harga pasar (market insights) */}
      {topCities.length > 0 && (
        <section className="section pt-0">
          <Container>
            <div className="market-teaser">
              <div>
                <h2 className="section-title">Berapa harga sewa di kotamu?</h2>
                <p className="section-sub mb-4">
                  Rata-rata harga sewa per bulan, dihitung dari {insights.data.summary.count} listing sewa di HouseHunt.
                  Median semua kota saat ini {formatRupiahShort(insights.data.summary.median)} per bulan.
                </p>
                <Link to="/insights" className="btn btn-outline-primary">
                  <Icon name="chart" size={18} /> Lihat data pasar lengkap
                </Link>
              </div>
              <div className="hh-panel">
                <BarList
                  ariaLabel="Rata-rata sewa per bulan di kota dengan listing terbanyak"
                  rows={topCities.map((c) => ({
                    key: c.city,
                    label: c.city,
                    value: c.average,
                    valueLabel: formatRupiahShort(c.average),
                    details: [`${c.count} listing sewa`, `Rentang ${formatRupiahShort(c.min)} – ${formatRupiahShort(c.max)}`],
                  }))}
                />
                <p className="market-teaser__note mb-0">Kota dengan listing sewa terbanyak. Arahkan kursor ke batang untuk melihat rentang harga.</p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Ajakan untuk pemilik properti */}
      {(!user || user.type === "owner") && (
        <section className="section pt-0">
          <Container>
            <div className="owner-cta">
              <div>
                <h2>Punya properti untuk disewakan?</h2>
                <p>Pasang listing gratis. Akun pemilik diverifikasi admin sebelum listing tampil, supaya penyewa lebih percaya.</p>
                <Link to={user ? "/owner/properties" : "/register?role=owner"} className="btn btn-accent btn-lg">
                  {user ? "Kelola properti" : "Daftar sebagai pemilik"} <Icon name="arrowRight" size={18} />
                </Link>
              </div>
              <ul>
                <li><Icon name="check" size={20} /> Unggah foto, fasilitas, spesifikasi, dan link video tour</li>
                <li><Icon name="message" size={20} /> Jawab pertanyaan calon penyewa lewat chat</li>
                <li><Icon name="calendar" size={20} /> Setujui atau tolak booking dari satu dashboard</li>
              </ul>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
