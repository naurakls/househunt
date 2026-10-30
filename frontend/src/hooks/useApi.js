import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../api/axios";

// Hook reusable untuk mengambil data dari API: { data, loading, error, reload }.
// request = fungsi yang mengembalikan promise axios. deps = kapan harus ambil ulang.
export default function useApi(request, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const latestRequest = useRef(0);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      // Abaikan respons lama jika sudah ada request yang lebih baru (misal filter diganti cepat)
      const requestId = ++latestRequest.current;
      if (!silent) setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await request();
        if (requestId === latestRequest.current) {
          setState({ data: response.data.data, loading: false, error: null });
        }
      } catch (error) {
        if (requestId === latestRequest.current) {
          setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error) }));
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
