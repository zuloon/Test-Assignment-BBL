import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppAuthProvider } from "./auth/AuthProvider";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import RouterApp from "./RouterApp";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppErrorBoundary>
        <AppAuthProvider>
          <RouterApp />
        </AppAuthProvider>
      </AppErrorBoundary>
    </ThemeProvider>
  );
}

export default App;