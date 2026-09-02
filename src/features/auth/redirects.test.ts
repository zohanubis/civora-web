import { describe, expect, it } from "vitest";

import { safeLocalPath } from "./redirects";

describe("safeLocalPath", () => {
  it("keeps a local application path", () => {
    expect(safeLocalPath("/reset-password?from=email", "/account")).toBe(
      "/reset-password?from=email",
    );
  });

  it("rejects protocol-relative redirects", () => {
    expect(safeLocalPath("//evil.example/path", "/account")).toBe("/account");
  });

  it("rejects absolute redirects", () => {
    expect(safeLocalPath("https://evil.example/path", "/account")).toBe("/account");
  });

  it("uses the fallback for missing redirect", () => {
    expect(safeLocalPath(null, "/account")).toBe("/account");
  });
});
