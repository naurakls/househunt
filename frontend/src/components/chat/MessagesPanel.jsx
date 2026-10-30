import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import EmptyState from "../common/EmptyState";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import usePolling from "../../hooks/usePolling";

// Panel pesan lengkap: daftar percakapan (kiri) + jendela chat (kanan).
// Percakapan aktif disimpan di URL: ?property=<id>&with=<id lawan bicara>
// sehingga bisa dibuka langsung dari tombol "Tanya Owner".
export default function MessagesPanel() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeProperty = params.get("property");
  const activeWith = params.get("with");
  const isOwner = user.type === "owner";
  // Owner wajib memilih renter; renter cukup properti (lawannya pasti owner)
  const hasActive = Boolean(activeProperty && (!isOwner || activeWith));

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get("/messages/conversations");
      setConversations(data.data);
    } catch {
      /* dicoba lagi di polling berikutnya */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);
  usePolling(loadConversations, 8000);

  const isActive = (c) =>
    c.property._id === activeProperty && (!activeWith || c.otherUser._id === activeWith);

  return (
    <div className={`messages${hasActive ? " messages--open" : ""}`}>
      <aside className="messages__list">
        <div className="messages__list-head">Percakapan</div>
        <ConversationList
          conversations={conversations}
          loading={loading}
          isActive={isActive}
          currentUser={user}
          onSelect={(c) => setParams({ property: c.property._id, with: c.otherUser._id })}
        />
      </aside>

      <section className="messages__chat">
        {hasActive ? (
          <ChatWindow
            key={`${activeProperty}:${activeWith || ""}`}
            propertyId={activeProperty}
            withUser={activeWith}
            onBack={() => setParams({})}
            onActivity={loadConversations}
          />
        ) : (
          <div className="chat__placeholder">
            <EmptyState
              icon="message"
              title="Pilih percakapan"
              text="Pilih salah satu percakapan di sebelah kiri untuk membaca dan membalas pesan."
            />
          </div>
        )}
      </section>
    </div>
  );
}
