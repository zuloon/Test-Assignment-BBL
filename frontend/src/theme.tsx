import { createTheme } from "@mui/material";

export const theme = createTheme({
  typography: {
    fontFamily: '\"Plus Jakarta Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      color: "#0f172a"
    },
    h5: {
      fontWeight: 700,
      color: "#0f172a"
    },
    h6: {
      fontWeight: 600,
      color: "#0f172a"
    },
    subtitle1: {
      color: "#64748b"
    },
    button: {
      textTransform: "none",
      fontWeight: 600
    }
  },
  palette: {
    mode: "light",
    primary: {
      main: "#4f46e5",
      light: "#818cf8",
      dark: "#3730a3",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#0f172a",
      light: "#334155",
      dark: "#020617"
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff"
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b"
    },
    divider: "#e2e8f0"
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "none",
          padding: "8px 16px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.15)",
            transform: "translateY(-1px)"
          }
        },
        contained: {
          background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #4338ca 0%, #2563eb 100%)"
          }
        },
        outlined: {
          borderColor: "#cbd5e1",
          "&:hover": {
            borderColor: "#94a3b8",
            backgroundColor: "#f8fafc"
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.01)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#ffffff",
            "& fieldset": {
              borderColor: "#e2e8f0",
              transition: "border-color 0.2s ease"
            },
            "&:hover fieldset": {
              borderColor: "#cbd5e1"
            },
            "&.Mui-focused fieldset": {
              borderColor: "#4f46e5"
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600
        }
      }
    }
  }
});