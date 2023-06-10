import { expect } from "@playwright/test";

import { FediverseHandler } from "./base";

export class SoshalHandler extends FediverseHandler {
  url = "https://soshal.localhost";
  user = "@test@soshal.localhost";

  async login() {
    // まれに /api/auth/signin?csrf=true にリダイレクトされることがあるのでリトライ
    await expect(async () => {
      await this.goto("/");
      await this.page.locator("[data-testid=login-button]").click();
      await this.page.waitForURL(
        (url) => url.pathname.startsWith("/api/auth/verify-request"),
        { timeout: 10000 }
      );
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
  }

  async expectPosted(content: string) {
    await this.goto("/");
    await expect(this.getNote(content)).toBeVisible();
  }

  async delete(content: string) {
    await this.goto("/");
    await this.getNote(content).getByTestId("delete-button").click();
  }

  async expectDeleted(content: string) {
    await this.goto("/");
    await expect(this.getNote(content)).not.toBeVisible();
  }

  async like(content: string) {
    await this.goto("/");
    await this.getNote(content).getByTestId("like-button").click();
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
  }

  async unfollow(user: string) {
    await this.follow(user);
  }

  async expectFollowing(user: string) {
    await this.goto(`/${user}`);
    await expect(this.page.getByTestId("follow-button")).toHaveText(
      "フォロー中"
    );
  }

  async expectFollowed(user: string) {
    // TODO: フォロワー一覧を実装したら実装
  }

  async expectNotFollowed(user: string) {
    // TODO: フォロワー一覧を実装したら実装
  }
}
