import { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { Modal, Select } from "antd";
import Icon from "../common/Icon";
import SafeImage from "../common/SafeImage";
import StatusBadge from "../common/StatusBadge";
import api, { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import useNotify from "../../hooks/useNotify";
import { AMENITY_OPTIONS, PROPERTY_TYPES } from "../../utils/format";
import { isPhone, MAX_IMAGES, validateImageFile } from "../../utils/validators";

const emptyForm = (user) => ({
  propertyType: "",
  adType: "rent",
  address: "",
  city: "",
  rentAmount: "",
  amenities: [],
  description: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  tourUrl: "",
  ownerContact: user?.phone || "",
  isAvailable: true,
});

const YOUTUBE_PATTERN = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/;
const toField = (value) => (value === undefined || value === null ? "" : String(value));

// Form tambah / edit properti di dalam modal Antd, termasuk upload & hapus foto
export default function PropertyFormModal({ open, property, onClose, onSaved }) {
  const { user } = useAuth();
  const notify = useNotify();
  const isEdit = Boolean(property);
  const [form, setForm] = useState(emptyForm(user));
  const [keptImages, setKeptImages] = useState([]); // foto lama yang dipertahankan
  const [newFiles, setNewFiles] = useState([]); // [{ file, preview }]
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const filesRef = useRef(newFiles);
  const defaultPhone = user?.phone;

  // Simpan daftar file terbaru agar URL preview bisa dibersihkan saat komponen dilepas
  useEffect(() => {
    filesRef.current = newFiles;
  }, [newFiles]);
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

  // Isi ulang form setiap modal dibuka
  useEffect(() => {
    if (!open) return;
    filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview));
    setForm(
      property
        ? {
            propertyType: property.propertyType,
            adType: property.adType,
            address: property.address,
            city: property.city,
            rentAmount: String(property.rentAmount),
            amenities: property.amenities,
            description: property.description || "",
            bedrooms: toField(property.bedrooms),
            bathrooms: toField(property.bathrooms),
            area: toField(property.area),
            tourUrl: property.tourUrl || "",
            ownerContact: property.ownerContact || "",
            isAvailable: property.isAvailable,
          }
        : emptyForm({ phone: defaultPhone })
    );
    setKeptImages(property?.images || []);
    setNewFiles([]);
    setErrors({});
  }, [open, property, defaultPhone]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const totalImages = keptImages.length + newFiles.length;

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // supaya file yang sama bisa dipilih lagi
    const accepted = [];
    for (const file of files) {
      const problem = validateImageFile(file);
      if (problem) notify.error(problem);
      else accepted.push({ file, preview: URL.createObjectURL(file) });
    }
    const room = MAX_IMAGES - totalImages;
    if (accepted.length > room) notify.error(`Maksimal ${MAX_IMAGES} foto per properti`);
    accepted.slice(room).forEach((f) => URL.revokeObjectURL(f.preview));
    setNewFiles((prev) => [...prev, ...accepted.slice(0, room)]);
    setErrors((er) => ({ ...er, images: undefined }));
  };

  const removeNewFile = (index) =>
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });

  const validate = () => {
    const next = {};
    if (!form.propertyType) next.propertyType = "Pilih tipe properti";
    if (form.address.trim().length < 5) next.address = "Alamat minimal 5 karakter";
    if (form.city.trim().length < 2) next.city = "Kota wajib diisi";
    if (!(Number(form.rentAmount) > 0)) next.rentAmount = "Masukkan harga lebih dari 0";
    if (form.ownerContact && !isPhone(form.ownerContact)) next.ownerContact = "Nomor HP tidak valid";
    if (form.description.length > 2000) next.description = "Deskripsi maksimal 2000 karakter";
    const isCount = (v) => v === "" || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 20);
    if (!isCount(form.bedrooms)) next.bedrooms = "Angka bulat 0–20";
    if (!isCount(form.bathrooms)) next.bathrooms = "Angka bulat 0–20";
    if (form.area !== "" && !(Number(form.area) > 0)) next.area = "Luas harus lebih dari 0";
    if (form.tourUrl.trim() && !YOUTUBE_PATTERN.test(form.tourUrl.trim())) next.tourUrl = "Gunakan link YouTube, contoh https://www.youtube.com/watch?v=...";
    if (totalImages === 0) next.images = "Unggah minimal 1 foto";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    // Data dikirim sebagai multipart/form-data karena berisi file
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "amenities") body.append(key, JSON.stringify(value));
      else body.append(key, String(value).trim());
    });
    if (isEdit) body.append("keepImages", JSON.stringify(keptImages));
    newFiles.forEach(({ file }) => body.append("images", file));

    setSaving(true);
    try {
      const { data } = isEdit
        ? await api.put(`/owner/properties/${property._id}`, body)
        : await api.post("/owner/properties", body);
      notify.success(data.message);
      onSaved?.(data.data);
      onClose();
    } catch (err) {
      notify.error(getErrorMessage(err, "Gagal menyimpan properti"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={saving ? undefined : onClose}
      title={isEdit ? "Edit properti" : "Tambah properti"}
      width={760}
      centered
      destroyOnHidden
      footer={
        <div className="d-flex justify-content-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Batal</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Spinner size="sm" animation="border" className="text-white" />}
            {isEdit ? "Simpan perubahan" : "Pasang properti"}
          </Button>
        </div>
      }
    >
      <Form noValidate onSubmit={handleSubmit} className="pt-2">
        <Row className="g-3">
          <Col sm={6}>
            <Form.Label htmlFor="propertyType">Tipe properti</Form.Label>
            <Form.Select
              id="propertyType"
              value={form.propertyType}
              onChange={(e) => set("propertyType", e.target.value)}
              isInvalid={!!errors.propertyType}
            >
              <option value="">Pilih tipe</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.propertyType}</Form.Control.Feedback>
          </Col>
          <Col sm={6}>
            <Form.Label htmlFor="adType">Jenis iklan</Form.Label>
            <Form.Select id="adType" value={form.adType} onChange={(e) => set("adType", e.target.value)}>
              <option value="rent">Disewakan</option>
              <option value="sale">Dijual</option>
            </Form.Select>
          </Col>
          <Col sm={8}>
            <Form.Label htmlFor="address">Alamat</Form.Label>
            <Form.Control
              id="address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              isInvalid={!!errors.address}
              placeholder="Jl. Melati No. 12, Kecamatan"
            />
            <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
          </Col>
          <Col sm={4}>
            <Form.Label htmlFor="city">Kota</Form.Label>
            <Form.Control
              id="city"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              isInvalid={!!errors.city}
              placeholder="Bandung"
            />
            <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
          </Col>
          <Col sm={6}>
            <Form.Label htmlFor="rentAmount">{form.adType === "sale" ? "Harga jual (Rp)" : "Harga sewa per bulan (Rp)"}</Form.Label>
            <Form.Control
              id="rentAmount"
              type="number"
              min={1}
              step={50000}
              value={form.rentAmount}
              onChange={(e) => set("rentAmount", e.target.value)}
              isInvalid={!!errors.rentAmount}
              placeholder="2500000"
            />
            <Form.Control.Feedback type="invalid">{errors.rentAmount}</Form.Control.Feedback>
          </Col>
          <Col sm={6}>
            <Form.Label htmlFor="ownerContact">Kontak yang bisa dihubungi</Form.Label>
            <Form.Control
              id="ownerContact"
              type="tel"
              value={form.ownerContact}
              onChange={(e) => set("ownerContact", e.target.value)}
              isInvalid={!!errors.ownerContact}
            />
            <Form.Control.Feedback type="invalid">{errors.ownerContact}</Form.Control.Feedback>
          </Col>
          {[
            ["bedrooms", "Kamar tidur", "2"],
            ["bathrooms", "Kamar mandi", "1"],
            ["area", "Luas bangunan (m²)", "90"],
          ].map(([key, label, placeholder]) => (
            <Col xs={4} key={key}>
              <Form.Label htmlFor={key}>{label}</Form.Label>
              <Form.Control
                id={key}
                type="number"
                min={key === "area" ? 1 : 0}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                isInvalid={!!errors[key]}
                placeholder={placeholder}
              />
              <Form.Control.Feedback type="invalid">{errors[key]}</Form.Control.Feedback>
            </Col>
          ))}
          <Col xs={12}>
            <Form.Label htmlFor="amenities">Fasilitas</Form.Label>
            <Select
              id="amenities"
              mode="tags"
              className="w-100"
              size="large"
              value={form.amenities}
              onChange={(value) => set("amenities", value)}
              options={AMENITY_OPTIONS.map((a) => ({ value: a, label: a }))}
              tokenSeparators={[","]}
              placeholder="Pilih atau ketik fasilitas lalu tekan Enter"
              maxCount={20}
            />
          </Col>
          <Col xs={12}>
            <Form.Label htmlFor="description">Deskripsi</Form.Label>
            <Form.Control
              id="description"
              as="textarea"
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              isInvalid={!!errors.description}
              placeholder="Ceritakan suasana, akses, dan hal menarik dari properti ini"
            />
            <Form.Text>{form.description.length}/2000</Form.Text>
            <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
          </Col>

          <Col xs={12}>
            <Form.Label htmlFor="tourUrl">Link video tour (opsional)</Form.Label>
            <Form.Control
              id="tourUrl"
              type="url"
              value={form.tourUrl}
              onChange={(e) => set("tourUrl", e.target.value)}
              isInvalid={!!errors.tourUrl}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <Form.Control.Feedback type="invalid">{errors.tourUrl}</Form.Control.Feedback>
            {!errors.tourUrl && <Form.Text>Video YouTube akan tampil di halaman detail sebagai virtual tour.</Form.Text>}
          </Col>

          <Col xs={12}>
            <Form.Label>Foto ({totalImages}/{MAX_IMAGES})</Form.Label>
            <div className="image-grid">
              {keptImages.map((path, i) => (
                <div className="image-tile" key={path}>
                  <SafeImage path={path} alt="" />
                  {i === 0 && <span className="image-tile__tag"><StatusBadge status="booked" label="Sampul" plain /></span>}
                  <button type="button" className="image-tile__remove" onClick={() => setKeptImages((p) => p.filter((x) => x !== path))} aria-label="Hapus foto">
                    <Icon name="x" size={14} strokeWidth={2.2} />
                  </button>
                </div>
              ))}
              {newFiles.map((f, i) => (
                <div className="image-tile" key={f.preview}>
                  <img src={f.preview} alt="" />
                  <span className="image-tile__tag"><StatusBadge status="pending" label="Baru" plain /></span>
                  <button type="button" className="image-tile__remove" onClick={() => removeNewFile(i)} aria-label="Hapus foto">
                    <Icon name="x" size={14} strokeWidth={2.2} />
                  </button>
                </div>
              ))}
              {totalImages < MAX_IMAGES && (
                <label className={`dropzone${errors.images ? " is-invalid" : ""}`}>
                  <Icon name="upload" size={22} />
                  Tambah foto
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} />
                </label>
              )}
            </div>
            {errors.images ? (
              <div className="invalid-feedback d-block">{errors.images}</div>
            ) : (
              <Form.Text>JPG, PNG, atau WEBP. Maksimal 2 MB per foto. Foto pertama menjadi sampul.</Form.Text>
            )}
          </Col>

          {isEdit && (
            <Col xs={12}>
              <Form.Check
                type="switch"
                id="isAvailable"
                label="Properti masih tersedia"
                checked={form.isAvailable}
                onChange={(e) => set("isAvailable", e.target.checked)}
              />
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
}
