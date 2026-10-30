import { createTheme } from "@mui/material/styles";
import { tokens } from "./tokens";

// Tema MUI disamakan dengan identitas HouseHunt: warna, font, dan radius 14px
export const muiTheme = createTheme({
  palette: {
    primary: { main: tokens.primary, dark: tokens.primaryHover, contrastText: "#FFFFFF" },
    secondary: { main: tokens.accent, dark: tokens.accentHover, contrastText: "#FFFFFF" },
    error: { main: tokens.danger },
    background: { default: tokens.bg, paper: tokens.surface },
    text: { primary: tokens.ink, secondary: tokens.muted },
    divider: tokens.line,
  },
  shape: { borderRadius: tokens.radius },
  typography: {
    fontFamily: tokens.fontBody,
    h1: { fontFamily: tokens.fontHeading, fontWeight: 600 },
    h2: { fontFamily: tokens.fontHeading, fontWeight: 600 },
    h3: { fontFamily: tokens.fontHeading, fontWeight: 600 },
    h4: { fontFamily: tokens.fontHeading, fontWeight: 600 },
    h5: { fontFamily: tokens.fontHeading, fontWeight: 600 },
    h6: { fontFamily: tokens.fontHeading, fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: tokens.radiusSm,
          transition: "background-color 200ms ease, color 200ms ease",
          "&.Mui-selected": {
            backgroundColor: tokens.primary,
            color: "#FFFFFF",
            "&:hover": { backgroundColor: tokens.primaryHover },
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: { root: { backgroundColor: "#ECE6DC" } },
    },
    MuiBadge: {
      styleOverrides: { badge: { fontWeight: 700, fontSize: 11, minWidth: 18, height: 18 } },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.primarySoft,
          color: tokens.primary,
          fontWeight: 600,
          fontFamily: tokens.fontBody,
        },
      },
    },
  },
});
