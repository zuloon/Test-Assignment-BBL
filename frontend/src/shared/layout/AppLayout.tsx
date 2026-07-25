import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
  navItems?: Array<{ label: string; to: string }>;
};

export function AppLayout({ children, navItems = [] }: AppLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box component="header" sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", minHeight: 64 }}>
            <Typography variant="h6" component="div">
              Bookmark Manager
            </Typography>
            <Stack component="nav" direction="row" spacing={1}>
              {navItems.map((item) => (
                <Button key={item.to} href={item.to} size="small">
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
