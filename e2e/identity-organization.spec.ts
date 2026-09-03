import { expect, test } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.describe("Phase 02 identity and organization", () => {
  test.skip(!email || !password, "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run managed Auth acceptance.");

  test("signs in and creates an owner organization", async ({ page }) => {
    const slug = `e2e-${Date.now()}`;

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();

    await page.getByLabel("Name").fill("Phase 02 E2E Organization");
    await page.getByLabel("Slug").fill(slug);
    await page.getByRole("button", { name: "Create organization" }).click();

    await expect(page.getByText(`/${slug}`)).toBeVisible();
    await expect(page.getByText("Phase 02 E2E Organization")).toBeVisible();
  });
});
