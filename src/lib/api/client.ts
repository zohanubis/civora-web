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

export type ApiRequestInit = RequestInit & {
  accessToken?: string | null;
};

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

export async function apiFetch<T>(path: string, init?: ApiRequestInit): Promise<T> {
  const { accessToken, ...requestInit } = init ?? {};
  const headers = new Headers(requestInit.headers);
  headers.set("Accept", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...requestInit,
    headers,
  });

  if (response.status === 204) {
    if (!response.ok) {
      throw new ApiError(`API request failed with status ${response.status}`, response.status);
    }
    return undefined as T;
  }

  const body = await response.text();
  const parsedBody = body ? safelyParseJson(body) : undefined;

  if (!response.ok) {
    throw new ApiError(
      `API request failed with status ${response.status}`,
      response.status,
      parsedBody,
    );
  }

  return parsedBody as T;
}

function safelyParseJson(body: string): unknown {
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}
