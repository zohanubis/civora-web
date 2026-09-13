import { expect, test } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.describe("Phase 02 identity and organization", () => {
  test.skip(!email || !password, "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run managed Auth acceptance.");

  test("persists an owner organization across re-login and supports owner lifecycle actions", async ({
    page,
  }) => {
    const slug = `e2e-${Date.now()}`;
    const originalName = "Phase 02 E2E Organization";
    const updatedName = "Phase 02 E2E Organization Updated";

    await signIn(page);

    await page.getByLabel("Name").fill(originalName);
    await page.getByLabel("Slug").fill(slug);
    await page.getByRole("button", { name: "Create organization" }).click();

    let card = page.locator("article").filter({ hasText: `/${slug}` });
    await expect(card).toBeVisible();
    await expect(card.getByText(originalName)).toBeVisible();
    await expect(card.getByText("ACTIVE")).toBeVisible();

    await card.getByRole("button", { name: "Edit" }).click();
    await card.getByLabel("Organization name").fill(updatedName);
    await card.getByLabel("Organization description").fill("Phase 02 persistence acceptance");
    await card.getByRole("button", { name: "Save" }).click();
    await expect(card.getByText(updatedName)).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/sign-in$/);

    await signIn(page);

    card = page.locator("article").filter({ hasText: `/${slug}` });
    await expect(card).toBeVisible();
    await expect(card.getByText(updatedName)).toBeVisible();
    await expect(card.getByText("Phase 02 persistence acceptance")).toBeVisible();

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await card.getByRole("button", { name: "Archive" }).click();
    await expect(card.getByText("ARCHIVED")).toBeVisible();
    await expect(card.getByRole("button", { name: "Edit" })).toHaveCount(0);
    await expect(card.getByRole("button", { name: "Archive" })).toHaveCount(0);
  });
});

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();
}
