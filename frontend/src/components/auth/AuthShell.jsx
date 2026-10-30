import { imageUrl } from "../../utils/format";

// Foto ruang tamu dari Unsplash untuk panel kiri halaman Login/Register
const AUTH_PHOTO = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0";

// Kerangka halaman Login/Register: foto di kiri (desktop) + form di kanan
export default function AuthShell({ kicker, title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__aside">
        <img src={imageUrl(AUTH_PHOTO, 1200)} alt="" />
        <div className="auth__caption">
          <strong>Langsung terhubung dengan pemilik</strong>
          <span>Tanyakan jadwal survei, biaya, dan aturan rumah lewat chat sebelum mengajukan sewa.</span>
        </div>
      </aside>

      <section className="auth__main">
        <div className="auth__card">
          {kicker && <span className="kicker">{kicker}</span>}
          <h1 className="auth__title">{title}</h1>
          <p className="text-muted mb-4">{subtitle}</p>
          {children}
          {footer && <div className="auth__footer">{footer}</div>}
        </div>
      </section>
    </div>
  );
}
