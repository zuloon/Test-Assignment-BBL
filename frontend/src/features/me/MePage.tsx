import { useAuth0 } from "@auth0/auth0-react";
import { Alert, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { KeyRound, LogOut, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { CurrentUserResponse, fetchCurrentUser } from "../../api/me";

type UserState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "ready"; user: CurrentUserResponse }
  | { type: "error"; message: string };

export function MePage() {
  const { getAccessTokenSilently, isAuthenticated, isLoading, loginWithRedirect, logout, user: auth0User } = useAuth0();
  const [userState, setUserState] = useState<UserState>({ type: "idle" });

  useEffect(() => {
    if (!isAuthenticated) {
      setUserState({ type: "idle" });
      return;
    }

    let isMounted = true;
    setUserState({ type: "loading" });

    fetchCurrentUser(getAccessTokenSilently)
      .then((user) => {
        if (isMounted) {
          setUserState({ type: "ready", user });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setUserState({
            type: "error",
            message: error instanceof Error ? error.message : "Unable to load current user"
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getAccessTokenSilently, isAuthenticated]);

  if (isLoading) {
    return (
      <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center", py: 4, justifyContent: "center" }}>
        <CircularProgress size={24} />
        <Typography color="text.secondary">Verifying Auth0 session...</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 760, mx: "auto" }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Account Profile
        </Typography>
        <Typography color="text.secondary">
          Manage your Auth0 session and review tenant security details.
        </Typography>
      </Box>

      {!isAuthenticated ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ p: 2, borderRadius: "50%", bgcolor: "#f1f5f9", color: "#64748b" }}>
              <User size={32} />
            </Box>
            <Typography variant="h5">You are not signed in</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 380 }}>
              Sign in with your Auth0 identity to manage bookmarks and private collections.
            </Typography>
            <Button variant="contained" onClick={() => void loginWithRedirect()} sx={{ px: 4 }}>
              Sign In with Auth0
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {isAuthenticated ? (
        <Stack spacing={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Avatar
                      src={auth0User?.picture}
                      alt={auth0User?.name || "User"}
                      sx={{ width: 56, height: 56, bgcolor: "#4f46e5", fontSize: "1.5rem" }}
                    >
                      {auth0User?.name?.[0] || <User size={24} />}
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {auth0User?.name || auth0User?.email}
                        </Typography>
                        <Chip
                          icon={<ShieldCheck size={12} color="#10b981" />}
                          label="Authenticated"
                          size="small"
                          sx={{ bgcolor: "#ecfdf5", color: "#047857", fontWeight: 700 }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {auth0User?.email}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogOut size={16} />}
                    onClick={() =>
                      logout({
                        logoutParams: {
                          returnTo: window.location.origin
                        }
                      })
                    }
                    sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                  >
                    Sign Out
                  </Button>
                </Stack>

                {userState.type === "loading" ? (
                  <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center", py: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">Validating bearer token with NestJS backend...</Typography>
                  </Stack>
                ) : null}

                {userState.type === "ready" ? (
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 3 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <KeyRound size={16} color="#4f46e5" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Backend Verified Tenant Details
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                        <Chip size="small" label={`Subject ID: ${userState.user.id}`} variant="outlined" />
                        <Chip size="small" label={`Email: ${userState.user.email}`} variant="outlined" />
                      </Stack>
                    </Stack>
                  </Paper>
                ) : null}

                {userState.type === "error" ? <Alert severity="error">{userState.message}</Alert> : null}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      ) : null}
    </Stack>
  );
}

