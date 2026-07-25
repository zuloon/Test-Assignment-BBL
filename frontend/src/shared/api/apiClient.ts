import { getApiBaseUrl } from "./config";

export type AccessTokenProvider = () => Promise<string>;

export async function apiGet<T>(path: string, getAccessToken: AccessTokenProvider): Promise<T> {
  return apiRequest<T>(path, getAccessToken);
}

export async function apiPost<T>(path: string, getAccessToken: AccessTokenProvider, body: unknown): Promise<T> {
  return apiRequest<T>(path, getAccessToken, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export async function apiPut<T>(path: string, getAccessToken: AccessTokenProvider, body: unknown): Promise<T> {
  return apiRequest<T>(path, getAccessToken, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}

export async function apiPatch<T>(path: string, getAccessToken: AccessTokenProvider, body: unknown): Promise<T> {
  return apiRequest<T>(path, getAccessToken, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export async function apiDelete<T>(path: string, getAccessToken: AccessTokenProvider, body?: unknown): Promise<T> {
  return apiRequest<T>(path, getAccessToken, {
    method: "DELETE",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
}

async function apiRequest<T>(path: string, getAccessToken: AccessTokenProvider, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}
