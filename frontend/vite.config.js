import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dengarkan di IPv4 & IPv6 sekaligus. Tanpa ini Vite hanya aktif di ::1,
    // sehingga browser yang membuka localhost via 127.0.0.1 gagal terhubung.
    // Bonus: bisa dibuka dari HP di Wi-Fi yang sama untuk tes tampilan mobile.
    host: true,
    port: 5173,
  },
  build: {
    // Library besar dipisah per vendor agar bisa di-cache browser secara terpisah
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-antd', test: /node_modules[\\/](antd|@ant-design|@rc-component|rc-[^\\/]+)[\\/]/ },
            { name: 'vendor-mui', test: /node_modules[\\/](@mui|@emotion)[\\/]/ },
            { name: 'vendor-bootstrap', test: /node_modules[\\/](react-bootstrap|@restart|@popperjs|mdb-react-ui-kit|dom-helpers)[\\/]/ },
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
    // Antd memang besar (komponen tabel, modal, dll.), batas peringatan dinaikkan sedikit
    chunkSizeWarningLimit: 1000,
  },
})
