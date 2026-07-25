import { AccessTokenProvider, apiGet } from "../shared/api/apiClient";

export type CurrentUserResponse = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};

export function fetchCurrentUser(getAccessToken: AccessTokenProvider) {
  return apiGet<CurrentUserResponse>("/me", getAccessToken);
}
