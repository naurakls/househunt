import { useMemo } from "react";
import { App } from "antd";

// Notifikasi sukses/error memakai Antd message (otomatis mengikuti tema HouseHunt)
export default function useNotify() {
  const { message } = App.useApp();
  return useMemo(
    () => ({
      success: (text) => message.success(text),
      error: (text) => message.error(text),
      info: (text) => message.info(text),
    }),
    [message]
  );
}
