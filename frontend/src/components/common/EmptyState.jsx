import Icon from "./Icon";

// Tampilan ramah saat data kosong / tidak ditemukan
export default function EmptyState({ icon = "inbox", title, text, action, compact = false }) {
  return (
    <div className={`empty${compact ? " empty--compact" : ""}`}>
      <div className="empty__icon">
        <Icon name={icon} size={28} />
      </div>
      <div className="empty__title">{title}</div>
      {text && <p className="empty__text">{text}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
