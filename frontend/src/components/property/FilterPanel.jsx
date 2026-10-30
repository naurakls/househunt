import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { AMENITY_OPTIONS, PROPERTY_TYPES } from "../../utils/format";

export const EMPTY_FILTERS = { city: "", minRent: "", maxRent: "", propertyType: "", minBedrooms: "", amenities: [], available: false };
const BEDROOM_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

// Panel filter: perubahan disimpan sebagai draft dan baru diterapkan saat klik "Terapkan"
// (hemat request ke server). Dipakai di sidebar desktop dan offcanvas HP.
export default function FilterPanel({ values, onApply }) {
  const [draft, setDraft] = useState(values);
  const [error, setError] = useState("");

  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const toggleAmenity = (item) =>
    set("amenities", draft.amenities.includes(item) ? draft.amenities.filter((a) => a !== item) : [...draft.amenities, item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const min = Number(draft.minRent);
    const max = Number(draft.maxRent);
    if (draft.minRent && draft.maxRent && min > max) {
      setError("Harga minimum tidak boleh lebih besar dari maksimum");
      return;
    }
    setError("");
    onApply(draft);
  };

  const reset = () => {
    setDraft(EMPTY_FILTERS);
    setError("");
    onApply(EMPTY_FILTERS);
  };

  return (
    <Form onSubmit={handleSubmit} className="hh-panel">
      <div className="filter-group">
        <div className="filter-group__title">Kota</div>
        <Form.Control
          value={draft.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Contoh: Bandung"
          aria-label="Kota"
        />
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Harga per bulan (Rp)</div>
        <Row className="g-2">
          <Col xs={6}>
            <Form.Control
              type="number"
              min={0}
              step={100000}
              value={draft.minRent}
              onChange={(e) => set("minRent", e.target.value)}
              placeholder="Min"
              aria-label="Harga minimum"
              isInvalid={!!error}
            />
          </Col>
          <Col xs={6}>
            <Form.Control
              type="number"
              min={0}
              step={100000}
              value={draft.maxRent}
              onChange={(e) => set("maxRent", e.target.value)}
              placeholder="Maks"
              aria-label="Harga maksimum"
              isInvalid={!!error}
            />
          </Col>
        </Row>
        {error && <div className="invalid-feedback d-block">{error}</div>}
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Tipe properti</div>
        <div className="chip-row">
          {[{ value: "", label: "Semua" }, ...PROPERTY_TYPES].map((t) => (
            <label className="chip-toggle" key={t.value || "all"}>
              <input
                type="radio"
                name="propertyType"
                checked={draft.propertyType === t.value}
                onChange={() => set("propertyType", t.value)}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Kamar tidur</div>
        <div className="chip-row">
          {BEDROOM_OPTIONS.map((o) => (
            <label className="chip-toggle" key={o.value || "all"}>
              <input
                type="radio"
                name="minBedrooms"
                checked={draft.minBedrooms === o.value}
                onChange={() => set("minBedrooms", o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Fasilitas</div>
        <div className="chip-row">
          {AMENITY_OPTIONS.map((item) => (
            <label className="chip-toggle" key={item}>
              <input type="checkbox" checked={draft.amenities.includes(item)} onChange={() => toggleAmenity(item)} />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <Form.Check
          type="switch"
          id="available-only"
          label="Hanya yang masih tersedia"
          checked={draft.available}
          onChange={(e) => set("available", e.target.checked)}
        />
      </div>

      <div className="d-grid gap-2 pt-2">
        <Button type="submit">Terapkan filter</Button>
        <Button variant="ghost" onClick={reset}>Reset</Button>
      </div>
    </Form>
  );
}
