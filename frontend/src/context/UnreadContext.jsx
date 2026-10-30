import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import usePolling from "../hooks/usePolling";

const UnreadContext = createContext({ unread: 0, refreshUnread: () => {} });

// Menyediakan jumlah pesan belum dibaca untuk badge di navbar & sidebar.
// Diperbarui otomatis tiap 15 detik (polling) supaya terasa real-time.
export function UnreadProvider({ children }) {
  const { user } = useAuth();
  const enabled = Boolean(user) && user.type !== "admin";
  const [count, setCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!enabled) return;
    try {
      const { data } = await api.get("/messages/unread-count");
      setCount(data.data.count);
    } catch {
      /* abaikan, dicoba lagi di polling berikutnya */
    }
  }, [enabled]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread, user?._id]);

  usePolling(refreshUnread, 15000, enabled);

  const value = useMemo(
    () => ({ unread: enabled ? count : 0, refreshUnread }),
    [enabled, count, refreshUnread]
  );
  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>;
}

export const useUnread = () => useContext(UnreadContext);
