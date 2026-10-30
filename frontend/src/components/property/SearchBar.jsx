import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../common/Icon";
import { PROPERTY_TYPES } from "../../utils/format";

export const BUDGET_OPTIONS = [
  { value: "", label: "Semua budget" },
  { value: "0-2000000", label: "Di bawah Rp2 jt" },
  { value: "2000000-5000000", label: "Rp2 – 5 jt" },
  { value: "5000000-10000000", label: "Rp5 – 10 jt" },
  { value: "10000000-", label: "Di atas Rp10 jt" },
];

// Search bar berbentuk pill di hero: kota + budget + tipe -> diarahkan ke halaman daftar properti
export default function SearchBar() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [type, setType] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    if (budget) {
      const [min, max] = budget.split("-");
      if (min && min !== "0") params.set("minRent", min);
      if (max) params.set("maxRent", max);
    }
    if (type) params.set("propertyType", type);
    const query = params.toString();
    navigate(`/properties${query ? `?${query}` : ""}`);
  };

  return (
    <form className="search-pill" onSubmit={handleSubmit} role="search">
      <label className="search-pill__field">
        <span>Kota</span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Mau tinggal di mana?"
          maxLength={60}
        />
      </label>
      <label className="search-pill__field">
        <span>Budget / bulan</span>
        <select value={budget} onChange={(e) => setBudget(e.target.value)}>
          {BUDGET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
      <label className="search-pill__field">
        <span>Tipe</span>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Semua tipe</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-accent search-pill__btn">
        <Icon name="search" size={18} />
        Cari
      </button>
    </form>
  );
}
