import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const login = async (page: Page) => {
  await page.goto("/");
  await page.locator("[data-testid=login-button]").click();
  await page.waitForURL((url) => url.pathname == "/api/auth/verify-request");
  await page.goto("http://localhost:8025");
  await page.locator(".msglist-message").first().click();
  const signInUrl = await page
    .frameLocator("iframe")
    .getByRole("link", { name: "Sign in" })
    .getAttribute("href");
  expect(signInUrl).toBeTruthy();
  await page.goto(signInUrl!);
  expect(page.locator("[data-testid=is-logged-in]")).toBeTruthy();
};

export const loginMisskey = async (page: Page) => {
  await page.goto("https://misskey.localhost");
  await page.locator("[data-cy-signin]").click();
  await page.locator("[data-cy-signin-username] input").fill("e2e");
  await page.locator("[data-cy-signin-password] input").fill("e2e");
  await page.locator("button[type=submit]").click();
  await expect(page.locator(".account")).toHaveText("@e2e");
};
