import { Auth0Provider } from "@auth0/auth0-react";
import { ReactNode } from "react";
import { getAuthConfig } from "./authConfig";

type AppAuthProviderProps = {
  children: ReactNode;
};

export function AppAuthProvider({ children }: AppAuthProviderProps) {
  const config = getAuthConfig();

  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      authorizationParams={{
        audience: config.audience,
        redirect_uri: config.redirectUri,
        scope: "openid profile email"
      }}
      cacheLocation="memory"
    >
      {children}
    </Auth0Provider>
  );
}
