import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const goto = async (page: Page, to: string) => {
  await expect(async () => {
    await page.goto(new URL(to, "https://misskey.localhost").toString());
    await expect(page.locator(".top")).toBeVisible();
    await expect(page.locator("text=再試行")).not.toBeVisible();
  }).toPass();
};

export const login = async (page: Page) => {
  await page.goto("https://misskey.localhost");
  // まれにローディングが終わらないことがあるのでタイムアウトを短めに
  // IndexedDBが原因っぽいが対処法が分からず
  await page.locator("[data-cy-signin]").click({ timeout: 3000 });
  await page.locator("[data-cy-signin-username] input").fill("e2e");
  await page.locator("[data-cy-signin-password] input").fill("e2e");
  await page.locator("button[type=submit]").click();
  await expect(page.locator(".account")).toBeVisible();
};

export const postNote = async (page: Page, content: string) => {
  await page.locator("[data-cy-open-post-form]").click();
  await page.locator("[data-cy-post-form-text]").fill(content);
  await page.locator("[data-cy-open-post-form-submit]").click();
  await expect(page.locator(`text=${content}`)).toBeVisible();
};

export const showGTL = async (page: Page) => {
  await goto(page, "/");
  await page.locator("button", { hasText: "グローバル" }).click();
};
