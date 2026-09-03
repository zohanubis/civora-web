import { describe, expect, it } from "vitest";

import { createOrganizationSchema } from "@/features/organizations/schemas/organization";

describe("createOrganizationSchema", () => {
  it("accepts a bounded URL-safe organization", () => {
    expect(
      createOrganizationSchema.safeParse({
        slug: "community-one",
        name: "Community One",
        description: "A local community",
      }).success,
    ).toBe(true);
  });

  it("rejects spaces and invalid slug bounds", () => {
    expect(
      createOrganizationSchema.safeParse({
        slug: "my community",
        name: "Community",
        description: "",
      }).success,
    ).toBe(false);
    expect(
      createOrganizationSchema.safeParse({ slug: "ab", name: "Community", description: "" }).success,
    ).toBe(false);
  });
});
