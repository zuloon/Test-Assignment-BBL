import { expect, test as setup } from "@playwright/test";
import { mkdirSync } from "node:fs";

const authFile = ".auth/user.json";

setup("authenticate with the provided Auth0 user", async ({ page }) => {
  const email = process.env.E2E_AUTH_EMAIL;
  const password = process.env.E2E_AUTH_PASSWORD;

  if (!email || !password) {
    throw new Error("Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD before running Playwright E2E tests.");
  }

  await page.goto("/collections");

  const loginButton = page.getByRole("button", { name: "Log In", exact: true });
  if (await loginButton.isVisible()) {
    await loginButton.click();
  }

  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("auth0.com")) {
    const emailInput = page.locator('input[name="username"], input[name="email"], input[type="email"]');
    await emailInput.fill(email);

    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    if ((await passwordInput.count()) === 0) {
      await page.locator('button[type="submit"][data-action-button-primary="true"]').click();
    }

    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(password);

    await page.locator('button[type="submit"][data-action-button-primary="true"]').click();
  }

  await page.waitForFunction(() => !window.location.hostname.includes("auth0.com"), undefined, { timeout: 30_000 });
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
  await expectLoggedIn(page);
  await page.goto("/collections");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByRole("heading", { name: "Collections" })).toBeVisible();
  await expectLoggedIn(page);

  mkdirSync(".auth", { recursive: true });
  await page.context().storageState({ path: authFile });
});

async function expectLoggedIn(page: import("@playwright/test").Page) {
  await expect(page.getByRole("button", { name: "Log In", exact: true })).toBeHidden({ timeout: 30_000 });
  await expect(page.locator('header button[aria-haspopup="menu"]')).toBeVisible({ timeout: 30_000 });
}
