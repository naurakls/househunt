import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import { getErrorMessage } from "../api/axios";
import { dashboardPath, useAuth } from "../context/AuthContext";
import useNotify from "../hooks/useNotify";
import { isEmail } from "../utils/validators";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!isEmail(form.email)) next.email = "Masukkan email yang valid";
    if (!form.password) next.password = "Password wajib diisi";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login(form.email.trim(), form.password);
      notify.success(`Selamat datang kembali, ${user.name.split(" ")[0]}!`);
      // Kembali ke halaman yang tadi diminta (misal detail properti), atau ke dashboard
      const from = location.state?.from;
      navigate(from ? `${from.pathname}${from.search || ""}` : dashboardPath(user), { replace: true });
    } catch (err) {
      notify.error(getErrorMessage(err, "Login gagal"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      kicker="Masuk"
      title="Selamat datang kembali"
      subtitle="Masuk untuk melanjutkan pencarian, booking, dan percakapanmu."
      footer={<>Belum punya akun? <Link to="/register" className="fw-semibold">Daftar sekarang</Link></>}
    >
      <Form noValidate onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={form.email}
            onChange={update("email")}
            isInvalid={!!errors.email}
            placeholder="nama@email.com"
            autoComplete="email"
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-4" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={form.password}
            onChange={update("password")}
            isInvalid={!!errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" size="lg" className="w-100" disabled={submitting}>
          {submitting && <Spinner size="sm" animation="border" className="text-white" />}
          Masuk
        </Button>
      </Form>
    </AuthShell>
  );
}
