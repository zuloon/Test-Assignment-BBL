import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, Box, Button, Chip, Container, Divider, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { Bookmark, Folder, Layers, LogOut, ShieldCheck, User } from "lucide-react";
import { MouseEvent, ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type AppLayoutProps = {
  children: ReactNode;
  navItems?: Array<{ label: string; to: string }>;
};

const iconMap: Record<string, ReactNode> = {
  "/": <Layers size={16} />,
  "/collections": <Folder size={16} />,
  "/bookmarks": <Bookmark size={16} />,
  "/all": <Layers size={16} />
};

export function AppLayout({ children, navItems = [] }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const isProfileMenuOpen = Boolean(profileAnchor);

  function openProfileMenu(event: MouseEvent<HTMLElement>) {
    setProfileAnchor(event.currentTarget);
  }

  function closeProfileMenu() {
    setProfileAnchor(null);
  }

  function signOut() {
    closeProfileMenu();
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
      {/* Sticky Header */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          backdropFilter: "blur(16px)",
          bgcolor: "rgba(255, 255, 255, 0.85)",
          borderBottom: "1px solid",
          borderColor: "divider",
          transition: "all 0.2s ease"
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", height: 70 }}>
            {/* Logo / Brand */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)"
                }}
              >
                <Bookmark size={20} />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.2 }}>
                    Bookmark Vault
                  </Typography>
                  <Chip
                    label="BBL"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      bgcolor: "#e0e7ff",
                      color: "#4338ca",
                      borderRadius: "6px"
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  Private Read-Later & Collections
                </Typography>
              </Box>
            </Stack>

            {/* Navigation items */}
            <Stack component="nav" direction="row" spacing={0.5} sx={{ bgcolor: "#f1f5f9", p: 0.5, borderRadius: "12px" }}>
              {navItems.map((item) => {
                const isActive =
                  item.to === "/"
                    ? location.pathname === "/" || location.pathname === "/all" || location.pathname === "/callback"
                    : location.pathname === item.to;
                return (
                  <Button
                    key={item.to}
                    size="small"
                    startIcon={iconMap[item.to]}
                    onClick={() => navigate(item.to)}
                    sx={{
                      px: 2,
                      py: 0.75,
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#0f172a" : "#64748b",
                      bgcolor: isActive ? "#ffffff" : "transparent",
                      boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      "&:hover": {
                        bgcolor: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                        color: "#0f172a"
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>

            {/* Auth / User Status */}
            <Box>
              {isAuthenticated ? (
                <>
                  <Stack
                    component="button"
                    direction="row"
                    spacing={1}
                    aria-controls={isProfileMenuOpen ? "profile-menu" : undefined}
                    aria-haspopup="menu"
                    aria-expanded={isProfileMenuOpen ? "true" : undefined}
                    sx={{
                      alignItems: "center",
                      cursor: "pointer",
                      px: 1.5,
                      py: 0.5,
                      border: 0,
                      borderRadius: "20px",
                      bgcolor: "#f1f5f9",
                      font: "inherit",
                      color: "inherit",
                      "&:hover": { bgcolor: "#e2e8f0" }
                    }}
                    onClick={openProfileMenu}
                  >
                    <Avatar
                      src={user?.picture}
                      alt={user?.name || "User"}
                      sx={{ width: 28, height: 28, fontSize: "0.85rem", bgcolor: "#4f46e5" }}
                    >
                      {user?.name?.[0] || <User size={16} />}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem", maxWidth: 120 }} noWrap>
                      {user?.name || user?.email?.split("@")[0] || "Account"}
                    </Typography>
                    <ShieldCheck size={16} color="#10b981" />
                  </Stack>
                  <Menu
                    id="profile-menu"
                    anchorEl={profileAnchor}
                    open={isProfileMenuOpen}
                    onClose={closeProfileMenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 1,
                          minWidth: 240,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)"
                        }
                      }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.25 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                        {user?.name || "Signed in"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {user?.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={signOut} sx={{ gap: 1.25, color: "error.main", fontWeight: 600 }}>
                      <LogOut size={16} />
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => void loginWithRedirect()}
                  sx={{ borderRadius: "8px" }}
                >
                  Log In
                </Button>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container component="main" maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {children}
      </Container>

      {/* Subtle Minimal Footer */}
      <Box component="footer" sx={{ py: 3, borderTop: "1px solid", borderColor: "divider", bgcolor: "#ffffff" }}>
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} Bangkok Bank Candidate Test — Private Bookmark Manager
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="caption" color="text.secondary">
                Auth0 RS256 PKCE
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Prisma Multi-Tenant Isolation
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

