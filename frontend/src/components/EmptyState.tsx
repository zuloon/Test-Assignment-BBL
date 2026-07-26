import { Box, Paper, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  iconBackground?: string;
  iconColor?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  iconBackground = "#f1f5f9",
  iconColor = "#94a3b8"
}: EmptyStateProps) {
  return (
    <Paper sx={{ p: 5, textAlign: "center", bgcolor: "#ffffff", borderRadius: 4, border: "1px dashed #cbd5e1" }}>
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        <Box sx={{ p: 2, borderRadius: "50%", bgcolor: iconBackground, color: iconColor }}>
          {icon}
        </Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          {description}
        </Typography>
        {action}
      </Stack>
    </Paper>
  );
}
