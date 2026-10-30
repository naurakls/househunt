import { ThemeProvider } from "@mui/material/styles";
import { ConfigProvider, App as AntdApp } from "antd";
import idID from "antd/locale/id_ID";
import { muiTheme } from "./muiTheme";
import { antdTheme } from "./antdTheme";

// Satu pembungkus untuk semua tema: MUI (ThemeProvider) + Antd (ConfigProvider).
// Bootstrap di-override lewat CSS variables di theme.css.
// AntdApp menyediakan context untuk notifikasi (message) yang ikut tema.
export default function AppThemeProvider({ children }) {
  return (
    <ThemeProvider theme={muiTheme}>
      <ConfigProvider theme={antdTheme} locale={idID}>
        <AntdApp message={{ top: 84, maxCount: 3 }}>{children}</AntdApp>
      </ConfigProvider>
    </ThemeProvider>
  );
}
