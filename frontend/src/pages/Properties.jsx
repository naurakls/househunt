import { useMemo, useState } from "react";
import { Button, Col, Container, Form, Offcanvas, Row } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import Icon from "../components/common/Icon";
import PropertyGrid from "../components/property/PropertyGrid";
import FilterPanel, { EMPTY_FILTERS } from "../components/property/FilterPanel";
import api from "../api/axios";
import useApi from "../hooks/useApi";

const PAGE_SIZE = 9;
const SORTS = [
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga terendah" },
  { value: "price_desc", label: "Harga tertinggi" },
];

// Filter disimpan di URL (?city=...&page=2) agar bisa dibagikan & tombol back browser tetap jalan
const readFilters = (params) => ({
  city: params.get("city") || "",
  minRent: params.get("minRent") || "",
  maxRent: params.get("maxRent") || "",
  propertyType: params.get("propertyType") || "",
  minBedrooms: params.get("minBedrooms") || "",
  amenities: params.get("amenities") ? params.get("amenities").split(",") : [],
  available: params.get("available") === "true",
});

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const filters = useMemo(() => readFilters(params), [params]);
  const page = Number(params.get("page")) || 1;
  const sort = params.get("sort") || "newest";
  const query = params.toString();

  const { data, loading, error } = useApi(
    () => api.get("/users/properties", { params: { ...Object.fromEntries(new URLSearchParams(query)), limit: PAGE_SIZE } }),
    [query]
  );

  const applyFilters = (next) => {
    const p = new URLSearchParams();
    if (next.city.trim()) p.set("city", next.city.trim());
    if (next.minRent) p.set("minRent", next.minRent);
    if (next.maxRent) p.set("maxRent", next.maxRent);
    if (next.propertyType) p.set("propertyType", next.propertyType);
    if (next.minBedrooms) p.set("minBedrooms", next.minBedrooms);
    if (next.amenities.length) p.set("amenities", next.amenities.join(","));
    if (next.available) p.set("available", "true");
    if (sort !== "newest") p.set("sort", sort);
    setParams(p); // halaman otomatis kembali ke 1
    setShowFilters(false);
  };

  const updateParam = (key, value) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.delete("page");
    setParams(p);
  };

  const activeCount =
    [filters.city, filters.minRent || filters.maxRent, filters.propertyType, filters.minBedrooms, filters.available].filter(Boolean).length +
    filters.amenities.length;
  const total = data?.pagination.total ?? 0;
  const panelKey = query; // remount panel saat URL berubah supaya draft ikut sinkron

  return (
    <Container className="py-4 py-lg-5">
      <PageHeader
        title="Cari properti"
        subtitle="Saring berdasarkan kota, harga, tipe, jumlah kamar, dan fasilitas."
      />

      <Row className="g-4">
        <Col lg={3} className="d-none d-lg-block">
          <div className="filters-sticky">
            <FilterPanel key={panelKey} values={filters} onApply={applyFilters} />
          </div>
        </Col>

        <Col lg={9}>
          <div className="results-bar">
            <Button variant="outline-primary" size="sm" className="d-lg-none" onClick={() => setShowFilters(true)}>
              <Icon name="filter" size={16} /> Filter{activeCount > 0 && ` (${activeCount})`}
            </Button>
            <span className="results-bar__count">{loading ? "Memuat…" : `${total} properti ditemukan`}</span>
            <Form.Select
              size="sm"
              className="results-bar__sort"
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value === "newest" ? "" : e.target.value)}
              aria-label="Urutkan"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Form.Select>
          </div>

          {error ? (
            <EmptyState icon="alert" title="Gagal memuat properti" text={error} />
          ) : (
            <PropertyGrid
              items={data?.items}
              loading={loading}
              colProps={{ xs: 12, sm: 6, xl: 4 }}
              emptyTitle="Belum ada yang cocok"
              emptyText="Coba longgarkan filter, atau cari di kota lain."
              emptyAction={
                activeCount > 0 && (
                  <Button variant="outline-primary" onClick={() => applyFilters(EMPTY_FILTERS)}>Reset filter</Button>
                )
              }
            />
          )}

          {/* Pagination MUI: hanya tampil jika lebih dari 1 halaman */}
          {data?.pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <Pagination
                count={data.pagination.totalPages}
                page={page}
                onChange={(_, value) => updateParam("page", value > 1 ? String(value) : "")}
                shape="rounded"
                color="primary"
              />
            </div>
          )}
        </Col>
      </Row>

      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="font-heading">Filter</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <FilterPanel key={panelKey} values={filters} onApply={applyFilters} />
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
}
