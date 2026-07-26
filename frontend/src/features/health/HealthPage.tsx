import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { Activity, ArrowRight, Bookmark, CheckCircle2, Folder, Lock, ShieldCheck, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { HealthResponse, fetchHealth } from "../../api/health";

type StatusState =
  | { type: "loading" }
  | { type: "ready"; health: HealthResponse }
  | { type: "error"; message: string };

export function HealthPage() {
  const [status, setStatus] = useState<StatusState>({ type: "loading" });
  const navigate = useNavigate();

  async function loadHealth() {
    setStatus({ type: "loading" });

    try {
      const health = await fetchHealth();
      setStatus({ type: "ready", health });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Backend health check failed"
      });
    }
  }

  useEffect(() => {
    void loadHealth();
  }, []);

  return (
    <Stack spacing={4}>
      {/* Hero Banner */}
      <Box sx={{ p: 4, borderRadius: 4, bgcolor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                System Overview
              </Typography>
              {status.type === "ready" ? (
                <Chip
                  icon={<CheckCircle2 size={14} color="#10b981" />}
                  label="Operational"
                  size="small"
                  sx={{ bgcolor: "#ecfdf5", color: "#047857", fontWeight: 700, borderRadius: "6px" }}
                />
              ) : null}
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Private read-later bookmark management service with tenant-level data isolation.
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshCw size={14} />}
            onClick={() => void loadHealth()}
            disabled={status.type === "loading"}
          >
            Refresh Status
          </Button>
        </Stack>
      </Box>

      {/* Backend Health Status Card */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    bgcolor: "#e0e7ff",
                    color: "#4338ca",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Activity size={20} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700 }}>
                    Backend Health Check
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    NestJS API service & PostgreSQL Prisma connectivity status
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            {status.type === "loading" ? (
              <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center", py: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">Connecting to backend server...</Typography>
              </Stack>
            ) : null}

            {status.type === "ready" ? (
              <Alert severity="success" icon={<CheckCircle2 size={20} />}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Backend is online and responding.
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label={`Service: ${status.health.service}`} sx={{ bgcolor: "#ffffff" }} />
                    <Chip size="small" label={`Status: ${status.health.status}`} color="success" />
                  </Stack>
                </Stack>
              </Alert>
            ) : null}

            {status.type === "error" ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => void loadHealth()}>
                    Retry Connection
                  </Button>
                }
              >
                {status.message}
              </Alert>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Navigation Cards */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Quick Workspaces
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { borderColor: "#4f46e5", transform: "translateY(-2px)" }
              }}
              onClick={() => navigate("/bookmarks")}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      bgcolor: "#eff6ff",
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Bookmark size={22} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
                      My Bookmarks
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Create, edit, search, and organize private web links.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", pt: 1, fontWeight: 600, fontSize: "0.875rem", color: "primary.main" }}>
                    <span>Open Bookmarks</span>
                    <ArrowRight size={16} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { borderColor: "#4f46e5", transform: "translateY(-2px)" }
              }}
              onClick={() => navigate("/collections")}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      bgcolor: "#f5f3ff",
                      color: "#7c3aed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Folder size={22} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
                      Collections
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Categorize bookmarks into custom folders & share with peers.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", pt: 1, fontWeight: 600, fontSize: "0.875rem", color: "primary.main" }}>
                    <span>Manage Collections</span>
                    <ArrowRight size={16} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { borderColor: "#4f46e5", transform: "translateY(-2px)" }
              }}
              onClick={() => navigate("/me")}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      bgcolor: "#ecfdf5",
                      color: "#059669",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <ShieldCheck size={22} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
                      Account & Security
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      View Auth0 session, Bearer Token status, and tenant identity.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", pt: 1, fontWeight: 600, fontSize: "0.875rem", color: "primary.main" }}>
                    <span>View Account</span>
                    <ArrowRight size={16} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}

