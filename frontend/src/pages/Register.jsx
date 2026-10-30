import { useState } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import Icon from "../components/common/Icon";
import { getErrorMessage } from "../api/axios";
import { dashboardPath, useAuth } from "../context/AuthContext";
import useNotify from "../hooks/useNotify";
import { isEmail, isPhone } from "../utils/validators";

const ROLES = [
  { value: "renter", icon: "search", title: "Saya mencari tempat", desc: "Cari, tanya, dan booking properti" },
  { value: "owner", icon: "building", title: "Saya pemilik", desc: "Pasang & kelola properti (perlu persetujuan admin)" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    type: params.get("role") === "owner" ? "owner" : "renter",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  // Validasi form sebelum dikirim ke backend
  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Nama minimal 2 karakter";
    if (!isEmail(form.email)) next.email = "Masukkan email yang valid";
    if (!isPhone(form.phone)) next.phone = "Nomor HP 9–15 digit, contoh 081234567890";
    if (form.password.length < 6) next.password = "Password minimal 6 karakter";
    if (form.confirm !== form.password) next.confirm = "Konfirmasi password tidak sama";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { user, message } = await register({
        type: form.type,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      notify.success(message);
      navigate(dashboardPath(user), { replace: true });
    } catch (err) {
      notify.error(getErrorMessage(err, "Registrasi gagal"));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <Form.Group className="mb-3" controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Control value={form[name]} onChange={update(name)} isInvalid={!!errors[name]} {...props} />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <AuthShell
      kicker="Daftar"
      title="Buat akun HouseHunt"
      subtitle="Gratis, dan hanya butuh satu menit."
      footer={<>Sudah punya akun? <Link to="/login" className="fw-semibold">Masuk</Link></>}
    >
      <Form noValidate onSubmit={handleSubmit}>
        <Form.Label>Daftar sebagai</Form.Label>
        <div className="role-options mb-4" role="radiogroup">
          {ROLES.map((role) => (
            <label className="role-option" key={role.value}>
              <input
                type="radio"
                name="type"
                value={role.value}
                checked={form.type === role.value}
                onChange={update("type")}
              />
              <span className="role-option__box">
                <Icon name={role.icon} size={22} />
                <span className="role-option__title">{role.title}</span>
                <span className="role-option__desc">{role.desc}</span>
              </span>
            </label>
          ))}
        </div>

        {field("name", "Nama lengkap", { placeholder: "Nama kamu", autoComplete: "name" })}
        {field("email", "Email", { type: "email", placeholder: "nama@email.com", autoComplete: "email" })}
        {field("phone", "Nomor HP", { type: "tel", placeholder: "081234567890", autoComplete: "tel" })}
        <Row className="g-3">
          <Col sm={6}>{field("password", "Password", { type: "password", autoComplete: "new-password" })}</Col>
          <Col sm={6}>{field("confirm", "Ulangi password", { type: "password", autoComplete: "new-password" })}</Col>
        </Row>

        <Button type="submit" size="lg" className="w-100 mt-2" disabled={submitting}>
          {submitting && <Spinner size="sm" animation="border" className="text-white" />}
          Buat akun
        </Button>
      </Form>
    </AuthShell>
  );
}
