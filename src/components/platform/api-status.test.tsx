import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiStatus } from "./api-status";
import { apiFetch } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiFetch: vi.fn(),
}));

const mockedApiFetch = vi.mocked(apiFetch);

function renderSubject() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ApiStatus />
    </QueryClientProvider>,
  );
}

describe("ApiStatus", () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  it("renders the API service when the platform ping succeeds", async () => {
    mockedApiFetch.mockResolvedValue({
      service: "civora-api",
      status: "ok",
      timestamp: "2026-09-03T00:00:00Z",
    });

    renderSubject();

    expect(await screen.findByText("Status: ok")).toBeInTheDocument();
    expect(screen.getByText("Service: civora-api")).toBeInTheDocument();
    expect(mockedApiFetch).toHaveBeenCalledWith("/api/v1/system/ping");
  });

  it("renders a recoverable message when the API cannot be reached", async () => {
    mockedApiFetch.mockRejectedValue(new Error("offline"));

    renderSubject();

    expect(
      await screen.findByText(/API is not reachable/i),
    ).toBeInTheDocument();
  });
});
