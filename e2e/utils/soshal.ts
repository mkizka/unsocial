import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const login = async (page: Page) => {
  // まれに /api/auth/signin?csrf=true にリダイレクトされることがあるのでリトライ
  await expect(async () => {
    await page.goto("/");
    await page.locator("[data-testid=login-button]").click();
    await page.waitForURL((url) => url.pathname != "/");
    expect(page.url()).toContain("/api/auth/verify-request");
  }).toPass();
  await page.goto("http://localhost:8025");
  await page.locator(".msglist-message").first().click();
  const signInUrl = await page
    .frameLocator("iframe")
    .getByRole("link", { name: "Sign in" })
    .getAttribute("href");
  await page.goto(signInUrl!);
  await expect(page.getByTestId("is-logged-in")).toBeVisible();
};

export const postNote = async (page: Page, content: string) => {
  await page.getByTestId("note-form__textarea").fill(content);
  await page.getByTestId("note-form__button").click();
  const note = page.locator("[data-testid=note-card]", { hasText: content });
  await expect(note).toBeVisible();
  return note;
};
