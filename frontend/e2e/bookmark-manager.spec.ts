import { expect, test } from "@playwright/test";

const runId = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

const qa = {
  collection: `E2E Collection ${runId}`,
  collectionUpdated: `E2E Collection Updated ${runId}`,
  bookmarkTitle: `E2E Bookmark ${runId}`,
  bookmarkTitleUpdated: `E2E Bookmark Updated ${runId}`,
  bookmarkUrl: `https://example.com/e2e-${runId}`,
  bookmarkUrlUpdated: `https://example.org/e2e-${runId}`,
  missingEmail: `missing-${runId}@example.invalid`
};

test.describe.configure({ mode: "serial" });

test("signed-in user can see the app shell", async ({ page }) => {
  await page.goto("/collections");

  await expect(page.getByRole("heading", { name: "Collections", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "All Vault", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Bookmarks", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log In", exact: true })).toBeHidden();
});

test("collections CRUD works from the UI", async ({ page }) => {
  await page.goto("/collections");

  await createCollection(page, qa.collection);
  await expect(page.getByRole("heading", { name: qa.collection, exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Edit ${qa.collection}`, exact: true }).click();
  await page.getByRole("textbox", { name: "Collection Name", exact: true }).fill(qa.collectionUpdated);
  await page.getByRole("button", { name: "Save", exact: true }).click();

  await expect(page.getByRole("heading", { name: qa.collectionUpdated, exact: true })).toBeVisible();

  await deleteCollection(page, qa.collectionUpdated);
  await expect(page.getByRole("heading", { name: qa.collectionUpdated, exact: true })).toBeHidden();
});

test("bookmarks CRUD and search work from the UI", async ({ page }) => {
  await page.goto("/bookmarks");

  await page.getByRole("button", { name: "Add Bookmark", exact: true }).click();
  await page.getByRole("textbox", { name: "URL", exact: true }).fill(qa.bookmarkUrl);
  await page.getByRole("textbox", { name: "Title", exact: true }).fill(qa.bookmarkTitle);
  await page.getByRole("textbox", { name: "Notes (Optional)", exact: true }).fill("Playwright create path");
  await page.getByRole("button", { name: "Save Bookmark", exact: true }).click();

  await expect(page.getByRole("heading", { name: qa.bookmarkTitle, exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Edit ${qa.bookmarkTitle}`, exact: true }).click();
  await page.getByRole("textbox", { name: "URL", exact: true }).fill(qa.bookmarkUrlUpdated);
  await page.getByRole("textbox", { name: "Title", exact: true }).fill(qa.bookmarkTitleUpdated);
  await page.getByRole("textbox", { name: "Notes (Optional)", exact: true }).fill("Playwright update path");
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();

  await expect(page.getByRole("heading", { name: qa.bookmarkTitleUpdated, exact: true })).toBeVisible();

  await page.getByRole("textbox", { name: "Search bookmarks by title, URL or notes...", exact: true }).fill(qa.bookmarkTitleUpdated);
  await expect(page.getByRole("heading", { name: qa.bookmarkTitleUpdated, exact: true })).toBeVisible();
  await expect(page.getByText("Playwright update path")).toBeVisible();

  await page.getByRole("button", { name: `Delete ${qa.bookmarkTitleUpdated}`, exact: true }).click();
  await expect(page.getByRole("heading", { name: qa.bookmarkTitleUpdated, exact: true })).toBeHidden();
  await expect(page.getByText("No bookmarks found")).toBeVisible();
});

test("collection error states are visible and recoverable", async ({ page }) => {
  await page.goto("/collections");

  await createCollection(page, qa.collection);

  await collectionCard(page, qa.collection).getByRole("button", { name: "Share Access", exact: true }).click();
  await expect(page.getByRole("heading", { name: `Share Collection "${qa.collection}"`, exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Recipient Email", exact: true }).fill(qa.missingEmail);
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page.getByText("User not found")).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();

  await page.getByRole("button", { name: `Delete ${qa.collection}`, exact: true }).click();
  await expect(page.getByRole("heading", { name: "Delete Collection", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Bookmark Action", exact: true }).click();
  await page.getByRole("option", { name: "Move bookmarks to another collection", exact: true }).click();
  await page.getByRole("button", { name: "Confirm Delete", exact: true }).click();
  await expect(page.getByText("Choose a collection to move bookmarks into.")).toBeVisible();

  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await deleteCollection(page, qa.collection);
  await expect(page.getByRole("heading", { name: qa.collection, exact: true })).toBeHidden();
});

test("all vault displays grouped collection bookmarks", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "All Vault", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "SECONDARY SCHOOL", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "UNIVERSITY", exact: true })).toBeVisible();
});

async function createCollection(page: import("@playwright/test").Page, name: string) {
  await page.getByRole("button", { name: "New Collection", exact: true }).click();
  await page.getByRole("textbox", { name: "Collection Name", exact: true }).fill(name);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
}

async function deleteCollection(page: import("@playwright/test").Page, name: string) {
  await page.getByRole("button", { name: `Delete ${name}`, exact: true }).click();
  await expect(page.getByRole("heading", { name: "Delete Collection", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Confirm Delete", exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeHidden();
}

function collectionCard(page: import("@playwright/test").Page, name: string) {
  return page.locator(".MuiCard-root").filter({
    has: page.getByRole("heading", { name, exact: true })
  });
}
