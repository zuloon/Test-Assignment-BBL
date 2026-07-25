import { getApiBaseUrl } from "./config";

export type AccessTokenProvider = () => Promise<string>;

export async function apiGet<T>(path: string, getAccessToken: AccessTokenProvider): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}
