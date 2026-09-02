const DEFAULT_API_URL = "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly problem?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => undefined);
    throw new ApiError(`API request failed with status ${response.status}`, response.status, problem);
  }

  return (await response.json()) as T;
}
