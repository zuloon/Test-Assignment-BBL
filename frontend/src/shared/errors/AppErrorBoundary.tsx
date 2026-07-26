import { Alert, Box, Button, Container, Stack, Typography } from "@mui/material";
import { Component, ErrorInfo, ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled frontend error", error, errorInfo);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 8 }}>
        <Container maxWidth="sm">
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Something went wrong
              </Typography>
              <Typography color="text.secondary">
                The app hit an unexpected error. You can reload and continue working.
              </Typography>
            </Box>

            <Alert severity="error">{this.state.error.message || "Unexpected frontend error"}</Alert>

            <Button variant="contained" onClick={() => window.location.reload()} sx={{ alignSelf: "flex-start" }}>
              Reload App
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }
}
