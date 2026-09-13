import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationWorkspace } from "@/features/organizations/components/organization-workspace";
import { ApiError } from "@/lib/api/client";

const mocks = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  routerRefresh: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  listOrganizations: vi.fn(),
  createOrganization: vi.fn(),
  updateOrganization: vi.fn(),
  archiveOrganization: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.routerReplace,
    refresh: mocks.routerRefresh,
  }),
}));

vi.mock("@/features/auth/api/auth", () => ({
  signOut: mocks.signOut,
}));

vi.mock("@/features/organizations/api/organizations", () => ({
  getCurrentUser: mocks.getCurrentUser,
  listOrganizations: mocks.listOrganizations,
  createOrganization: mocks.createOrganization,
  updateOrganization: mocks.updateOrganization,
  archiveOrganization: mocks.archiveOrganization,
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "phase-02-token" } },
      }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: mocks.unsubscribe } },
      })),
    },
  }),
}));

describe("OrganizationWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signOut.mockResolvedValue({ error: null });
    mocks.listOrganizations.mockResolvedValue([]);
  });

  it("signs out and returns to sign in when the API rejects the session with 401", async () => {
    mocks.getCurrentUser.mockRejectedValue(new ApiError("Unauthorized", 401));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OrganizationWorkspace />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
    expect(mocks.routerReplace).toHaveBeenCalledWith("/sign-in?reason=session-expired");
    expect(mocks.routerRefresh).toHaveBeenCalledTimes(1);
  });
});
