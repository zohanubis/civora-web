import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ForgotPasswordForm,
  ResetPasswordForm,
} from "@/features/auth/components/password-recovery-form";

const mocks = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  routerRefresh: vi.fn(),
  requestPasswordReset: vi.fn(),
  updatePassword: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.routerReplace,
    refresh: mocks.routerRefresh,
  }),
}));

vi.mock("@/features/auth/api/auth", () => ({
  requestPasswordReset: mocks.requestPasswordReset,
  updatePassword: mocks.updatePassword,
}));

describe("password recovery forms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests a recovery email without revealing whether the account exists", async () => {
    mocks.requestPasswordReset.mockResolvedValue({ data: {}, error: null });

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: " owner@example.com " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset email" }));

    await waitFor(() =>
      expect(mocks.requestPasswordReset).toHaveBeenCalledWith("owner@example.com"),
    );
    expect(screen.getByRole("status").textContent).toContain("If the account exists");
  });

  it("rejects a short replacement password before calling Supabase", async () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("at least 8 characters"),
    );
    expect(mocks.updatePassword).not.toHaveBeenCalled();
  });

  it("updates the password and returns to the authenticated workspace", async () => {
    mocks.updatePassword.mockResolvedValue({ data: {}, error: null });

    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-password-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => expect(mocks.updatePassword).toHaveBeenCalledWith("new-password-123"));
    expect(mocks.routerReplace).toHaveBeenCalledWith("/app");
    expect(mocks.routerRefresh).toHaveBeenCalledTimes(1);
  });
});
