import { CircularProgress, Stack, Typography } from "@mui/material";

type LoadingStateProps = {
  message: string;
  size?: number;
  py?: number;
  variant?: "body1" | "body2";
  centered?: boolean;
};

export function LoadingState({ message, size = 24, py = 4, variant = "body1", centered = true }: LoadingStateProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      role="status"
      sx={{ alignItems: "center", py, justifyContent: centered ? "center" : "flex-start" }}
    >
      <CircularProgress size={size} />
      <Typography variant={variant} color="text.secondary">
        {message}
      </Typography>
    </Stack>
  );
}
