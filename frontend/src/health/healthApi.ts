import { getApiBaseUrl } from "../shared/api/config";

export type HealthResponse = {
  status: "ok";
  service: "backend";
};

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${getApiBaseUrl()}/health`);

  if (!response.ok) {
    throw new Error("Backend health check failed");
  }

  return response.json() as Promise<HealthResponse>;
}
