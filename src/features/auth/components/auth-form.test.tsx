import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthForm } from "@/features/auth/components/auth-form";

const mocks = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  routerRefresh: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.routerReplace,
    refresh: mocks.routerRefresh,
  }),
}));

vi.mock("@/features/auth/api/auth", () => ({
  signIn: mocks.signIn,
  signUp: mocks.signUp,
}));

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects an authenticated sign-in to the workspace", async () => {
    mocks.signIn.mockResolvedValue({
      data: { session: { access_token: "phase-02-token" } },
      error: null,
    });

    render(<AuthForm mode="sign-in" />);
    fillCredentials();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(mocks.signIn).toHaveBeenCalledWith("owner@example.com", "password123"));
    expect(mocks.routerReplace).toHaveBeenCalledWith("/app");
    expect(mocks.routerRefresh).toHaveBeenCalledTimes(1);
  });

  it("shows the confirmation state when sign-up requires email verification", async () => {
    mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });

    render(<AuthForm mode="sign-up" />);
    fillCredentials();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(mocks.signUp).toHaveBeenCalledWith("owner@example.com", "password123"));
    expect(screen.getByRole("status").textContent).toContain("Check your email");
    expect(mocks.routerReplace).not.toHaveBeenCalled();
  });

  it("shows a deterministic message when the auth service is unreachable", async () => {
    mocks.signIn.mockRejectedValue(new Error("network down"));

    render(<AuthForm mode="sign-in" />);
    fillCredentials();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("Unable to reach the authentication service"),
    );
    expect(mocks.routerReplace).not.toHaveBeenCalled();
  });
});

function fillCredentials() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "owner@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "password123" },
  });
}
