import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppAuthProvider } from "./auth/AuthProvider";
import { CollectionsPage } from "./collections/CollectionsPage";
import { AppLayout } from "./shared/layout/AppLayout";
import { HealthPage } from "./health/HealthPage";
import { MePage } from "./me/MePage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1f5f8b"
    },
    secondary: {
      main: "#6b5b2a"
    },
    background: {
      default: "#f7f8fa"
    }
  },
  shape: {
    borderRadius: 6
  }
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppAuthProvider>
        <BrowserRouter>
          <AppLayout
            navItems={[
              { label: "Status", to: "/" },
              { label: "Account", to: "/me" },
              { label: "Collections", to: "/collections" }
            ]}
          >
            <Routes>
              <Route path="/" element={<HealthPage />} />
              <Route path="/callback" element={<MePage />} />
              <Route path="/me" element={<MePage />} />
              <Route path="/collections" element={<CollectionsPage />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AppAuthProvider>
    </ThemeProvider>
  );
}
