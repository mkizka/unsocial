import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

const retry = async (times: number, func: (i?: number) => Promise<void>) => {
  for (const i of [...Array(times).keys()]) {
    try {
      await func(i);
      break;
    } catch (e) {
      if (i === times - 1) {
        throw e;
      }
    }
  }
};

export const login = async (page: Page) => {
  // まれに /api/auth/signin?csrf=true にリダイレクトされることがあるのでリトライ
  await retry(3, async () => {
    await page.goto("/");
    await page.locator("[data-testid=login-button]").click();
    await page.waitForURL((url) => url.pathname != "/");
    if (new URL(page.url()).pathname != "/api/auth/verify-request") {
      throw new Error();
    }
  });
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
