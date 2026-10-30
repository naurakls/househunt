import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// Urutan CSS penting: Bootstrap dulu, lalu tema HouseHunt yang menimpanya
import "bootstrap/dist/css/bootstrap.min.css";
import "./theme/theme.css";
import "./styles/app.css";
import App from "./App.jsx";
import AppThemeProvider from "./theme/AppThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { UnreadProvider } from "./context/UnreadContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <AuthProvider>
          <UnreadProvider>
            <App />
          </UnreadProvider>
        </AuthProvider>
      </AppThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
