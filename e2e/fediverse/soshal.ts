import { expect } from "@playwright/test";

import { FediverseHandler } from "./base";

export class SoshalHandler extends FediverseHandler {
  user = "@test@soshal.localhost";

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
    await this.goto("/");
    await this.page.getByTestId("note-form__textarea").fill(content);
    await this.page.getByTestId("note-form__button").click();
    await expect(this.getNote(content)).toBeVisible();
    await this.waitForFederation();
  }

  async expectPosted(content: string) {
    await this.goto("/");
    await expect(this.getNote(content)).toBeVisible();
  }

  async delete(content: string) {
    await this.goto("/");
    await this.getNote(content).getByTestId("delete-button").click();
    await this.waitForFederation();
  }

  async expectDeleted(content: string) {
    await this.goto("/");
    await expect(this.getNote(content)).not.toBeVisible();
  }

  async like(content: string) {
    await this.goto("/");
    await this.getNote(content).getByTestId("like-button").click();
    await this.waitForFederation();
  }

  async expectLiked(content: string) {
    await this.goto("/");
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

  async expectFollowing(user: string) {
    await this.goto(`/${user}`);
    await expect(this.page.getByTestId("follow-button")).toHaveText(
      "フォロー中"
    );
  }

  async expectFollowed(user: string) {
    // TODO: 実装
  }

  async expectNotFollowed(user: string) {
    // TODO: 実装
  }
}
