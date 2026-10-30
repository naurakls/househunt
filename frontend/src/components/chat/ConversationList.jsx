import Skeleton from "@mui/material/Skeleton";
import EmptyState from "../common/EmptyState";
import Icon from "../common/Icon";
import SafeImage from "../common/SafeImage";
import { chatTime, propertyTitle } from "../../utils/format";

// Daftar percakapan: foto properti, nama lawan bicara, pesan terakhir, jumlah belum dibaca
export default function ConversationList({ conversations, loading, isActive, onSelect, currentUser }) {
  if (loading) {
    return Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="convo-item">
        <Skeleton variant="rounded" width={52} height={52} />
        <div className="flex-grow-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="90%" />
        </div>
      </div>
    ));
  }

  if (!conversations.length) {
    return (
      <EmptyState
        compact
        icon="message"
        title="Belum ada percakapan"
        text={
          currentUser.type === "owner"
            ? "Pertanyaan dari calon penyewa akan muncul di sini."
            : "Buka detail properti lalu klik “Tanya Owner” untuk mulai bertanya."
        }
      />
    );
  }

  return conversations.map((c) => {
    const mine = c.lastMessage.senderId === currentUser._id;
    return (
      <button
        type="button"
        key={`${c.property._id}:${c.otherUser._id}`}
        className={`convo-item${isActive(c) ? " is-active" : ""}${c.unreadCount ? " is-unread" : ""}`}
        onClick={() => onSelect(c)}
      >
        <SafeImage path={c.property.images?.[0]} alt="" />
        <div className="convo-item__body">
          <div className="convo-item__top">
            <span className="convo-item__name">{c.otherUser.name}</span>
            <span className="convo-item__time">{chatTime(c.lastMessage.createdAt)}</span>
          </div>
          <div className="convo-item__property">{propertyTitle(c.property)}</div>
          <div className="convo-item__bottom">
            <span className="convo-item__preview">
              {mine && (
                <Icon
                  name={c.lastMessage.isRead ? "checks" : "check"}
                  size={14}
                  strokeWidth={2}
                  className={`convo-item__tick${c.lastMessage.isRead ? " is-read" : ""}`}
                />
              )}
              {mine && "Kamu: "}
              {c.lastMessage.text}
            </span>
            {c.unreadCount > 0 && <span className="unread-pill">{c.unreadCount}</span>}
          </div>
        </div>
      </button>
    );
  });
}
