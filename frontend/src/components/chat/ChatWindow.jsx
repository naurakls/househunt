import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import EmptyState from "../common/EmptyState";
import SafeImage from "../common/SafeImage";
import api, { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useUnread } from "../../context/UnreadContext";
import usePolling from "../../hooks/usePolling";
import useNotify from "../../hooks/useNotify";
import { chatTime, dayLabel, isSameDay, propertyTitle } from "../../utils/format";

const MAX_LENGTH = 1000;
const POLL_MS = 2500; // pesan baru dicek tiap 2,5 detik selama chat terbuka

// Pertanyaan / jawaban cepat, berbeda untuk renter dan owner
const QUICK_REPLIES = {
  renter: [
    "Apakah masih tersedia?",
    "Kapan saya bisa survei?",
    "Sudah termasuk listrik & air?",
    "Minimal sewa berapa bulan?",
    "Boleh bawa hewan peliharaan?",
  ],
  owner: [
    "Masih tersedia, silakan survei.",
    "Bisa, kabari jadwalnya ya.",
    "Sudah termasuk listrik & air.",
    "Minimal sewa 3 bulan.",
    "Terima kasih sudah bertanya!",
  ],
};

// Pesan lokal yang belum dikonfirmasi server (status "sending"/"failed") tetap dipertahankan
// saat polling, kecuali server sudah punya pesan yang sama
const mergeMessages = (serverMessages, localMessages) => {
  const pending = localMessages.filter(
    (local) =>
      local.status &&
      !serverMessages.some(
        (s) =>
          s.senderId === local.senderId &&
          s.text === local.text &&
          Math.abs(new Date(s.createdAt) - new Date(local.createdAt)) < 60000
      )
  );
  return [...serverMessages, ...pending];
};

// Jendela chat satu percakapan
export default function ChatWindow({ propertyId, withUser, onBack, onActivity }) {
  const { user } = useAuth();
  const { refreshUnread } = useUnread();
  const notify = useNotify();
  const [conversation, setConversation] = useState(null);
  const [error, setError] = useState(null);
  const [text, setText] = useState("");
  const [showNewPill, setShowNewPill] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const atBottomRef = useRef(true);
  const lastCountRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/messages/property/${propertyId}`, {
        params: withUser ? { withUser } : {},
      });
      setConversation((prev) => ({
        ...data.data,
        messages: mergeMessages(data.data.messages, prev?.messages || []),
      }));
      setError(null);

      // Tandai pesan masuk sebagai sudah dibaca -> pengirim melihat tanda ✓✓
      const hasUnread = data.data.messages.some((m) => !m.isRead && m.receiverId === user._id);
      if (hasUnread) {
        await api.patch(`/messages/property/${propertyId}/read`, { withUser: data.data.otherUser._id });
        refreshUnread();
        onActivity?.();
      }
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat percakapan"));
    }
  }, [propertyId, withUser, user._id, refreshUnread, onActivity]);

  useEffect(() => {
    load();
  }, [load]);
  usePolling(load, POLL_MS);

  const scrollToBottom = (smooth = false) => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setShowNewPill(false);
  };

  // Pesan bertambah: gulir otomatis jika user sedang di bawah / pesan dari diri sendiri,
  // kalau sedang membaca pesan lama tampilkan tombol "Pesan baru"
  const messages = conversation?.messages || [];
  useLayoutEffect(() => {
    if (messages.length === lastCountRef.current) return;
    const firstLoad = lastCountRef.current === 0;
    const last = messages[messages.length - 1];
    lastCountRef.current = messages.length;
    if (firstLoad || atBottomRef.current || last?.senderId === user._id) scrollToBottom(!firstLoad);
    else setShowNewPill(true);
  }, [messages, user._id]);

  const handleScroll = () => {
    const el = bodyRef.current;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (atBottomRef.current) setShowNewPill(false);
  };

  // Kotak ketik membesar otomatis (maksimal ±5 baris)
  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };
  useEffect(resizeInput, [text]);

  const patchMessage = (id, patch) =>
    setConversation((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => (m._id === id ? (patch ? { ...m, ...patch } : null) : m)).filter(Boolean),
    }));

  // Kirim pesan secara "optimistic": langsung tampil, lalu dikonfirmasi server
  const deliver = async (messageText, existingId) => {
    const tempId = existingId || `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      senderId: user._id,
      text: messageText,
      createdAt: new Date().toISOString(),
      isRead: false,
      status: "sending",
    };
    if (existingId) patchMessage(existingId, { status: "sending" });
    else setConversation((prev) => ({ ...prev, messages: [...prev.messages, optimistic] }));

    try {
      const isOwner = conversation.property.ownerId === user._id;
      const { data } = await api.post("/messages", {
        propertyId,
        text: messageText,
        ...(isOwner ? { receiverId: conversation.otherUser._id } : {}),
      });
      setConversation((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => (m._id === tempId ? data.data : m)),
      }));
      onActivity?.();
    } catch (err) {
      patchMessage(tempId, { status: "failed" });
      notify.error(getErrorMessage(err, "Pesan gagal dikirim"));
    }
  };

  const send = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_LENGTH) return notify.error(`Pesan maksimal ${MAX_LENGTH} karakter`);
    setText("");
    deliver(trimmed);
    inputRef.current?.focus();
  };

  // Enter = kirim, Shift+Enter = baris baru
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const applyQuickReply = (reply) => {
    setText(reply);
    inputRef.current?.focus();
  };

  if (error && !conversation) {
    return (
      <div className="chat__placeholder">
        <EmptyState icon="alert" title="Percakapan tidak bisa dibuka" text={error} />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="chat__placeholder">
        <Spinner animation="border" />
      </div>
    );
  }

  const { property, otherUser } = conversation;
  const quickReplies = QUICK_REPLIES[user.type] || [];

  return (
    <div className="chat">
      <header className="chat__header">
        <Button variant="ghost" size="sm" className="chat__back" onClick={onBack} aria-label="Kembali">
          <Icon name="arrowLeft" size={18} />
        </Button>
        <SafeImage path={property.images?.[0]} alt="" />
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <Link to={`/properties/${property._id}`} className="chat__header-title">
            {propertyTitle(property)}
          </Link>
          <span className="chat__header-sub">
            {otherUser.type === "owner" ? "Pemilik" : "Calon penyewa"} · {otherUser.name}
          </span>
        </div>
      </header>

      <div className="chat__body" ref={bodyRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <EmptyState
            compact
            icon="message"
            title="Mulai percakapan"
            text={`Tanyakan apa saja ke ${otherUser.name}: jadwal survei, biaya, atau aturan rumah. Pilih pertanyaan cepat di bawah untuk memulai.`}
          />
        ) : (
          messages.map((m, i) => {
            const mine = m.senderId === user._id;
            const showDay = i === 0 || !isSameDay(messages[i - 1].createdAt, m.createdAt);
            return (
              <Fragment key={m._id}>
                {showDay && (
                  <div className="day-sep"><span>{dayLabel(m.createdAt)}</span></div>
                )}
                <div className={`bubble-row${mine ? " bubble-row--mine" : ""}`}>
                  <div className={`bubble ${mine ? "bubble--mine" : "bubble--theirs"}${m.status === "failed" ? " bubble--failed" : ""}`}>
                    {m.text}
                    <span className="bubble__meta">
                      {chatTime(m.createdAt)}
                      {mine && <MessageStatus message={m} />}
                    </span>
                  </div>
                </div>
                {m.status === "failed" && (
                  <div className="bubble-retry">
                    Gagal terkirim ·{" "}
                    <button type="button" onClick={() => deliver(m.text, m._id)}>
                      <Icon name="refresh" size={13} /> Coba lagi
                    </button>
                  </div>
                )}
              </Fragment>
            );
          })
        )}
      </div>

      {showNewPill && (
        <button type="button" className="new-pill" onClick={() => scrollToBottom(true)}>
          <Icon name="arrowDown" size={15} /> Pesan baru
        </button>
      )}

      {!text && quickReplies.length > 0 && (
        <div className="quick-replies" aria-label="Pesan cepat">
          {quickReplies.map((reply) => (
            <button type="button" key={reply} className="quick-reply" onClick={() => applyQuickReply(reply)}>
              {reply}
            </button>
          ))}
        </div>
      )}

      <Form className="chat__composer" onSubmit={send}>
        <Form.Control
          ref={inputRef}
          as="textarea"
          rows={1}
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis pesan…"
          aria-label="Tulis pesan"
        />
        <Button type="submit" className="chat__send" disabled={!text.trim()} aria-label="Kirim">
          <Icon name="send" size={18} />
        </Button>
      </Form>
    </div>
  );
}

// Status pesan milik sendiri: jam pasir (mengirim), ✓ (terkirim), ✓✓ (dibaca)
function MessageStatus({ message }) {
  const [icon, label, extra] =
    message.status === "sending"
      ? ["clock", "Mengirim…", ""]
      : message.status === "failed"
        ? ["alert", "Gagal terkirim", ""]
        : message.isRead
          ? ["checks", "Dibaca", " is-read"]
          : ["check", "Terkirim", ""];
  return (
    <span className={`bubble__status${extra}`} title={label}>
      <Icon name={icon} size={icon === "checks" ? 15 : 13} strokeWidth={2} />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
