import { tokens } from "./tokens";

// Tema Antd (ConfigProvider) memakai token yang sama dengan Bootstrap & MUI
export const antdTheme = {
  token: {
    colorPrimary: tokens.primary,
    colorLink: tokens.primary,
    colorInfo: tokens.primary,
    colorSuccess: "#3E7B65",
    colorWarning: "#C9932E",
    colorError: tokens.danger,
    colorText: tokens.ink,
    colorTextSecondary: tokens.muted,
    colorTextTertiary: tokens.muted,
    colorBorder: tokens.line,
    colorBorderSecondary: tokens.line,
    colorBgLayout: tokens.bg,
    colorBgContainer: tokens.surface,
    colorBgElevated: tokens.surface,
    fontFamily: tokens.fontBody,
    fontSize: 15,
    borderRadius: tokens.radiusSm,
    borderRadiusLG: tokens.radius,
    borderRadiusSM: 8,
    controlHeight: 40,
    boxShadow: tokens.shadow,
    boxShadowSecondary: tokens.shadow,
    motionDurationMid: "0.2s",
    // Modal, popconfirm & notifikasi Antd harus tampil di atas navbar sticky Bootstrap (z-index 1020)
    zIndexPopupBase: 1100,
    wireframe: false,
  },
  components: {
    // Tabel dengan baris berjarak lega
    Table: {
      headerBg: tokens.surface2,
      headerColor: tokens.muted,
      headerSplitColor: "transparent",
      rowHoverBg: "#FAF8F4",
      borderColor: tokens.line,
      cellPaddingBlock: 18,
      cellPaddingInline: 16,
    },
    Button: { fontWeight: 600, primaryShadow: "none", defaultShadow: "none", dangerShadow: "none" },
    Modal: { titleFontSize: 22 },
    Segmented: { trackBg: "#EFEBE4", itemSelectedBg: tokens.surface, itemColor: tokens.muted },
    Select: { optionSelectedBg: tokens.primarySoft },
  },
};
