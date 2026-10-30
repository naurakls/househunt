// Judul halaman: keterangan kecil (opsional) + judul + deskripsi + tombol aksi
export default function PageHeader({ kicker, title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        {kicker && <span className="kicker">{kicker}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
