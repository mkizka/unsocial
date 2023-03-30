import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("他サーバーのアカウントを表示できる", async ({ page }) => {
  const response = await page.goto("/@e2e@misskey.localhost");
  expect(response?.status()).toBe(200);
});

test("他サーバーの存在しないアカウントには404を返す", async ({ page }) => {
  const response = await page.goto("/@notfound@misskey.localhost");
  expect(response?.status()).toBe(404);
});

test("存在しないサーバーのアカウントには404を返す", async ({ page }) => {
  const response = await page.goto("/@e2e@notfound.localhost");
  expect(response?.status()).toBe(404);
});

const login = async (page: Page) => {
  await page.goto("/");
  await page.click("[data-test-id=login-button]");
  await page.goto("http://localhost:8025");
  await page.click(".msglist-message");
  await page
    .frameLocator("iFrame")
    .getByRole("link", { name: "Sign in" })
    .click();
  expect(page.locator("[data-test-id=is-logged-in]")).toBeTruthy();
};

test("作成したノートが他サーバーに連合される", async ({ page, context }) => {
  await login(page);
  // TODO: 実装
});
