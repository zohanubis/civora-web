import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  getSession: vi.fn(),
  apiFetch: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getClaims: mocks.getClaims,
      getSession: mocks.getSession,
    },
  })),
}));

vi.mock("./client", () => ({
  apiFetch: mocks.apiFetch,
}));

import { authenticatedApiFetch, AuthenticationRequiredError } from "./authenticated-client";

describe("authenticatedApiFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: "supabase-user" } }, error: null });
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "verified-access-token" } },
      error: null,
    });
    mocks.apiFetch.mockResolvedValue({ ok: true });
  });

  it("rejects when claims cannot verify the session", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: null }, error: new Error("invalid") });

    await expect(authenticatedApiFetch("/api/v1/me")).rejects.toBeInstanceOf(
      AuthenticationRequiredError,
    );
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  it("rejects when no access token is available after claim verification", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });

    await expect(authenticatedApiFetch("/api/v1/me")).rejects.toBeInstanceOf(
      AuthenticationRequiredError,
    );
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  it("forwards the verified session access token to Civora API", async () => {
    await authenticatedApiFetch("/api/v1/me", { method: "GET" });

    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/v1/me", {
      method: "GET",
      headers: { Authorization: "Bearer verified-access-token" },
    });
  });

  it("does not allow caller supplied authorization to override the session token", async () => {
    await authenticatedApiFetch("/api/v1/me", {
      headers: { Authorization: "Bearer attacker-token", "X-Request-Id": "request-1" },
    });

    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/v1/me", {
      headers: {
        Authorization: "Bearer verified-access-token",
        "x-request-id": "request-1",
      },
    });
  });
});
