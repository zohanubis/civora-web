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

  it("canonicalizes slug casing before submission", () => {
    const result = createOrganizationSchema.safeParse({
      slug: " Community-One ",
      name: "Community One",
      description: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("community-one");
    }
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
