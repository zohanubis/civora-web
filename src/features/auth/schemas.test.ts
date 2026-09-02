import { describe, expect, it } from "vitest";

import { emailSchema, resetPasswordSchema, signInSchema } from "./schemas";

describe("auth schemas", () => {
  it("normalizes email addresses", () => {
    expect(emailSchema.parse(" Owner@Example.COM ")).toBe("owner@example.com");
  });

  it("rejects invalid email addresses", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });

  it("requires a password of at least eight characters", () => {
    expect(signInSchema.safeParse({ email: "owner@example.com", password: "short" }).success).toBe(
      false,
    );
  });

  it("accepts a valid reset password", () => {
    expect(resetPasswordSchema.safeParse({ password: "long-enough-password" }).success).toBe(true);
  });
});
