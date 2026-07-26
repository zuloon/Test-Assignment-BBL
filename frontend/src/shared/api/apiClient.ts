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

type ErrorResponseBody = {
  message?: string | string[];
  error?: string;
};

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
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as ErrorResponseBody;
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message;

    if (message) {
      return message;
    }

    if (body.error) {
      return body.error;
    }
  } catch {
    // Fall back to status text below when the backend returns an empty or non-JSON body.
  }

  return response.statusText || `API request failed with ${response.status}`;
}
