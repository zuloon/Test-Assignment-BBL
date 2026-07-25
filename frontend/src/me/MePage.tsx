import { useAuth0 } from "@auth0/auth0-react";
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { CurrentUserResponse, fetchCurrentUser } from "./meApi";

type UserState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "ready"; user: CurrentUserResponse }
  | { type: "error"; message: string };

export function MePage() {
  const { getAccessTokenSilently, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
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
      <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center" }}>
        <CircularProgress size={20} />
        <Typography>Checking login state</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 760 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Account
        </Typography>
        <Typography color="text.secondary">
          Sign in to verify the API bearer-token path and current-user endpoint.
        </Typography>
      </Box>

      {!isAuthenticated ? (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => void loginWithRedirect()}>
              Log in
            </Button>
          }
        >
          You are not signed in.
        </Alert>
      ) : null}

      {isAuthenticated ? (
        <Stack spacing={2}>
          <Button
            variant="outlined"
            onClick={() =>
              logout({
                logoutParams: {
                  returnTo: window.location.origin
                }
              })
            }
            sx={{ alignSelf: "flex-start" }}
          >
            Log out
          </Button>

          {userState.type === "loading" ? (
            <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center" }}>
              <CircularProgress size={20} />
              <Typography>Loading current user</Typography>
            </Stack>
          ) : null}

          {userState.type === "ready" ? (
            <Alert severity="success">
              <Stack spacing={1}>
                <Typography>Signed in as {userState.user.email}</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  <Chip size="small" label={userState.user.id} />
                  {userState.user.name ? <Chip size="small" label={userState.user.name} /> : null}
                </Stack>
              </Stack>
            </Alert>
          ) : null}

          {userState.type === "error" ? <Alert severity="error">{userState.message}</Alert> : null}
        </Stack>
      ) : null}
    </Stack>
  );
}
