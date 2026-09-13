import { afterEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api/client";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds the bearer token without replacing existing request headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch<{ ok: boolean }>("/api/v1/me", {
      accessToken: "access-token",
      headers: { "X-Request-Id": "request-1" },
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer access-token");
    expect(headers.get("X-Request-Id")).toBe("request-1");
    expect(headers.get("Accept")).toBe("application/json");
  });

  it("returns undefined for successful no-content responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(
      apiFetch<void>("/api/v1/organizations/example/archive", {
        method: "POST",
        accessToken: "access-token",
      }),
    ).resolves.toBeUndefined();
  });

  it("preserves RFC 9457 problem details on API failures", async () => {
    const problem = {
      type: "https://civora.dev/problems/organization-conflict",
      title: "Organization conflict",
      status: 409,
      detail: "Organization slug already exists.",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(problem), {
          status: 409,
          headers: { "Content-Type": "application/problem+json" },
        }),
      ),
    );

    const request = apiFetch("/api/v1/organizations", {
      method: "POST",
      accessToken: "access-token",
    });

    await expect(request).rejects.toMatchObject({
      status: 409,
      problem,
    });
  });
});
