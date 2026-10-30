import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { TOKEN_KEY } from "../api/axios";

const USER_KEY = "hh_user";
const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)) : null;
  } catch {
    return null;
  }
};

// Halaman utama tiap role setelah login
export const dashboardPath = (user) =>
  ({ renter: "/renter", owner: "/owner", admin: "/admin" })[user?.type] || "/";

// AuthContext menyimpan user & token yang sedang login dan bisa dipakai di semua komponen
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const saveSession = useCallback((token, nextUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // Ambil data terbaru dari server (misal status owner baru disetujui admin)
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return null;
    const { data } = await api.get("/users/me");
    localStorage.setItem(USER_KEY, JSON.stringify(data.data));
    setUser(data.data);
    return data.data;
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post("/users/login", { email, password });
      saveSession(data.data.token, data.data.user);
      return data.data.user;
    },
    [saveSession]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post("/users/register", payload);
      saveSession(data.data.token, data.data.user);
      return { user: data.data.user, message: data.message };
    },
    [saveSession]
  );

  // Saat aplikasi dibuka, cocokkan data user tersimpan dengan server
  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  // Event dari interceptor axios saat token tidak valid
  useEffect(() => {
    window.addEventListener("hh:unauthorized", logout);
    return () => window.removeEventListener("hh:unauthorized", logout);
  }, [logout]);

  const value = useMemo(
    () => ({ user, login, register, logout, refreshUser }),
    [user, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
