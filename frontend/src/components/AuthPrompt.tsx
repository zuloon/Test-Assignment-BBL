import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

type AuthPromptProps = {
  icon: ReactNode;
  title: string;
  description: string;
  onLogin: () => void;
  buttonLabel?: string;
  iconBackground?: string;
  iconColor?: string;
};

export function AuthPrompt({
  icon,
  title,
  description,
  onLogin,
  buttonLabel = "Log in with Auth0",
  iconBackground = "#f1f5f9",
  iconColor = "#64748b"
}: AuthPromptProps) {
  return (
    <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        <Box sx={{ p: 2, borderRadius: "50%", bgcolor: iconBackground, color: iconColor }}>
          {icon}
        </Box>
        <Typography variant="h5">{title}</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
          {description}
        </Typography>
        <Button variant="contained" onClick={onLogin} sx={{ px: 4 }}>
          {buttonLabel}
        </Button>
      </Stack>
    </Paper>
  );
}
