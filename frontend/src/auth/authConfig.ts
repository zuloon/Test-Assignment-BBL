export type AuthConfig = {
  domain: string;
  clientId: string;
  audience: string;
  redirectUri: string;
};

export function getAuthConfig(): AuthConfig {
  return {
    domain: import.meta.env.VITE_AUTH0_DOMAIN ?? "dev-yg.us.auth0.com",
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID ?? "H9F6QG5SzTKMv0tbmgxLj9LjG1EKVllA",
    audience: import.meta.env.VITE_AUTH0_AUDIENCE ?? "https://bbl-candidate-test-api",
    redirectUri: `${window.location.origin}/callback`
  };
}
