import { expect, test } from "@playwright/test";

test("renders the Civora platform foundation shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Platform foundation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "API connection" })).toBeVisible();
});
