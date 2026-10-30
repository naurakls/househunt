import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Icon from "../common/Icon";
import StatusBadge from "../common/StatusBadge";
import api, { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import useNotify from "../../hooks/useNotify";
import { formatPrice, fromNow, priceSuffix } from "../../utils/format";
import { isPhone } from "../../utils/validators";

// Kartu samping di detail properti: harga, owner, form booking, tombol "Tanya Owner".
// myBooking = booking aktif renter untuk properti ini (jika ada)
export default function BookingCard({ property, myBooking, onBooked }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const [form, setForm] = useState({ renterName: user?.name || "", renterContact: user?.phone || "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isRenter = user?.type === "renter";
  const owner = property.ownerId;
  const goLogin = () => navigate("/login", { state: { from: location } });

  const handleAsk = () => (user ? navigate(`/messages?property=${property._id}`) : goLogin());

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.renterName.trim().length < 2) next.renterName = "Nama minimal 2 karakter";
    if (!isPhone(form.renterContact)) next.renterContact = "Nomor HP tidak valid";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/users/bookings", { propertyId: property._id, ...form });
      notify.success(data.message);
      onBooked?.(data.data);
    } catch (err) {
      notify.error(getErrorMessage(err, "Booking gagal"));
    } finally {
      setSubmitting(false);
    }
  };

  const renderAction = () => {
    if (myBooking) {
      return (
        <div className="note">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <strong className="text-body">Booking kamu</strong>
            <StatusBadge status={myBooking.bookingStatus} />
          </div>
          Diajukan {fromNow(myBooking.createdAt)}.{" "}
          <Link to="/renter" className="fw-semibold">Lihat di dashboard</Link>
        </div>
      );
    }
    if (!property.isAvailable) {
      return <div className="note">Properti ini sudah {property.adType === "sale" ? "terjual" : "disewa"}. Coba lihat properti lain, ya.</div>;
    }
    if (!user) {
      return (
        <Button variant="accent" size="lg" className="w-100" onClick={goLogin}>
          Masuk untuk booking
        </Button>
      );
    }
    if (!isRenter) {
      return <div className="note">Booking hanya bisa dilakukan dengan akun renter.</div>;
    }
    return (
      <Form noValidate onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="renterName">
          <Form.Label>Nama penyewa</Form.Label>
          <Form.Control
            value={form.renterName}
            onChange={(e) => setForm({ ...form, renterName: e.target.value })}
            isInvalid={!!errors.renterName}
          />
          <Form.Control.Feedback type="invalid">{errors.renterName}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="renterContact">
          <Form.Label>Nomor HP</Form.Label>
          <Form.Control
            type="tel"
            value={form.renterContact}
            onChange={(e) => setForm({ ...form, renterContact: e.target.value })}
            isInvalid={!!errors.renterContact}
          />
          <Form.Control.Feedback type="invalid">{errors.renterContact}</Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" variant="accent" size="lg" className="w-100" disabled={submitting}>
          {submitting && <Spinner size="sm" animation="border" />}
          Ajukan booking
        </Button>
        <p className="form-text text-center mt-2 mb-0">Owner akan mengonfirmasi booking kamu.</p>
      </Form>
    );
  };

  return (
    <div className="hh-panel booking-card">
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
        <div className="price">
          {formatPrice(property.rentAmount, property.adType)}
          <small>{priceSuffix(property.adType)}</small>
        </div>
        <StatusBadge status={property.isAvailable ? "available" : property.adType === "sale" ? "sold" : "rented"} />
      </div>

      <div className="owner-line">
        <Avatar sx={{ width: 42, height: 42 }}>{owner?.name?.charAt(0) || "?"}</Avatar>
        <div>
          <div className="owner-line__name">{owner?.name || "Pemilik"}</div>
          <div className="owner-line__meta">
            {user ? (
              <span className="d-inline-flex align-items-center gap-1">
                <Icon name="phone" size={13} /> {property.ownerContact}
              </span>
            ) : (
              "Masuk untuk melihat kontak"
            )}
          </div>
        </div>
      </div>

      {renderAction()}

      {(!user || isRenter) && (
        <Button variant="outline-primary" className="w-100 mt-3" onClick={handleAsk}>
          <Icon name="message" size={18} /> Tanya Owner
        </Button>
      )}
    </div>
  );
}
