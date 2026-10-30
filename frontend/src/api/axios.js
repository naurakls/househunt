import axios from "axios";

// Base URL backend diambil dari frontend/.env (VITE_API_URL)
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
export const TOKEN_KEY = "hh_token";

const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 15000 });

// Interceptor request: token JWT otomatis dipasang di header Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor response: token kedaluwarsa/tidak valid -> AuthContext melakukan logout otomatis
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      window.dispatchEvent(new Event("hh:unauthorized"));
    }
    return Promise.reject(error);
  }
);

// Mengambil pesan error dari format respons backend { success, message, data }
export const getErrorMessage = (error, fallback = "Terjadi kesalahan, coba lagi") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ERR_NETWORK") return "Tidak bisa terhubung ke server. Pastikan backend berjalan.";
  if (error?.code === "ECONNABORTED") return "Server terlalu lama merespons, coba lagi";
  return fallback;
};

export default api;
