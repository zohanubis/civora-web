import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      updateUser: mocks.updateUser,
    },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import {
  forgotPassword,
  resetPassword,
  signIn,
  signUp,
} from "./actions";

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("auth server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  });

  it("rejects invalid sign-in input before calling Supabase", async () => {
    await expect(signIn(form({ email: "bad", password: "short" }))).rejects.toThrow(
      "REDIRECT:/sign-in?error=invalid-input",
    );
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("normalizes email and signs in with password", async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });

    await expect(
      signIn(form({ email: " Owner@Example.COM ", password: "correct-password" })),
    ).rejects.toThrow("REDIRECT:/account");

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "correct-password",
    });
  });

  it("sign-up sends a Civora confirmation callback", async () => {
    mocks.signUp.mockResolvedValue({ error: null });

    await expect(
      signUp(form({ email: "new@example.com", password: "correct-password" })),
    ).rejects.toThrow("REDIRECT:/sign-in?message=check-email");

    expect(mocks.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "correct-password",
      options: { emailRedirectTo: "http://localhost:3000/auth/confirm" },
    });
  });

  it("password recovery uses a non-enumerating result even when provider returns an error", async () => {
    mocks.resetPasswordForEmail.mockResolvedValue({ error: new Error("user not found") });

    await expect(forgotPassword(form({ email: "unknown@example.com" }))).rejects.toThrow(
      "REDIRECT:/forgot-password?message=check-email",
    );

    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith("unknown@example.com", {
      redirectTo: "http://localhost:3000/auth/confirm?next=/reset-password",
    });
  });

  it("updates password only after valid reset input", async () => {
    mocks.updateUser.mockResolvedValue({ error: null });

    await expect(resetPassword(form({ password: "new-secure-password" }))).rejects.toThrow(
      "REDIRECT:/account?message=password-updated",
    );
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: "new-secure-password" });
  });
});
