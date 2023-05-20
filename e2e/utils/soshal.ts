import { expect } from "@playwright/test";

import { FediversePage } from "./base";

export class SoshalPage extends FediversePage {
  async login() {
    // まれに /api/auth/signin?csrf=true にリダイレクトされることがあるのでリトライ
    await expect(async () => {
      await this.page.goto("/");
      await this.page.locator("[data-testid=login-button]").click();
      await this.page.waitForURL((url) => url.pathname != "/");
      expect(this.page.url()).toContain("/api/auth/verify-request");
    }).toPass();
    await this.page.goto("http://localhost:8025");
    await this.page.locator(".msglist-message").first().click();
    const signInUrl = await this.page
      .frameLocator("iframe")
      .getByRole("link", { name: "Sign in" })
      .getAttribute("href");
    await this.page.goto(signInUrl!);
    await expect(this.page.getByTestId("is-logged-in")).toBeVisible();
  }

  getNote(content: string) {
    return this.page.locator("[data-testid=note-card]", { hasText: content });
  }

  async postNote(content: string) {
    await this.page.getByTestId("note-form__textarea").fill(content);
    await this.page.getByTestId("note-form__button").click();
    await expect(this.getNote(content)).toBeVisible();
    await this.waitForFederation();
  }

  async delete(content: string) {
    await this.getNote(content).getByTestId("delete-button").click();
    await this.waitForFederation();
  }

  async like(content: string) {
    await this.getNote(content).getByTestId("like-button").click();
    await this.waitForFederation();
  }

  async expectLiked(content: string) {
    await this.getNote(content).getByTestId("note-card__link").click();
    await this.page.waitForURL((url) => url.pathname.startsWith("/notes/"));
    await expect(
      this.page.locator("text=@e2e@misskey.localhost")
    ).toBeVisible();
  }

  async follow(user: string) {
    await this.goto(`/${user}`);
    await this.page.getByTestId("follow-button").click();
    await this.waitForFederation();
  }
}
