import { useEffect, useRef } from "react";

// Menjalankan callback berkala (polling) untuk update data "real-time".
// Hanya berjalan saat tab browser sedang dilihat, supaya hemat request.
export default function usePolling(callback, delay, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return undefined;
    const tick = () => {
      if (document.visibilityState === "visible") savedCallback.current();
    };
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay, enabled]);
}
