import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { HealthResponse, fetchHealth } from "./healthApi";

type StatusState =
  | { type: "loading" }
  | { type: "ready"; health: HealthResponse }
  | { type: "error"; message: string };

export function HealthPage() {
  const [status, setStatus] = useState<StatusState>({ type: "loading" });

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
    <Stack spacing={3} sx={{ maxWidth: 760 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          BBL Bookmark Manager
        </Typography>
        <Typography color="text.secondary">
          Foundation slice for the private read-later app.
        </Typography>
      </Box>

      {status.type === "loading" ? (
        <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center" }}>
          <CircularProgress size={20} />
          <Typography>Checking backend health</Typography>
        </Stack>
      ) : null}

      {status.type === "ready" ? (
        <Alert severity="success">
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography>Backend connected</Typography>
            <Chip size="small" label={status.health.service} />
            <Chip size="small" label={status.health.status} />
          </Stack>
        </Alert>
      ) : null}

      {status.type === "error" ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void loadHealth()}>
              Retry
            </Button>
          }
        >
          {status.message}
        </Alert>
      ) : null}
    </Stack>
  );
}
