import { expect } from "@playwright/test";

import { FediverseHandler } from "./base";

export class MastodonHandler extends FediverseHandler {
  domain = "mastodon.localhost";
  user = "@e2e@mastodon.localhost";

  async login() {
    await this.goto("/auth/sign_in");
    await this.page.locator("#user_email").fill("e2e@localhost");
    await this.page.locator("#user_password").fill("password");
    await this.page.locator("button").click();
    await expect(this.page.locator("text=@e2e")).toBeVisible();
  }

  async expectedUser(user: string) {
    await this.goto("/");
    await this.page.locator(".search__input").fill(user);
    await this.page.locator(".search__input").press("Enter");
    await expect(
      this.page.locator(".display-name__account", { hasText: user }),
    ).toBeVisible();
  }

  getNote(content: string) {
    return this.page.locator("article", { hasText: content });
  }

  async postNote(content: string) {
    await this.goto("/");
    await this.page.locator(".autosuggest-textarea__textarea").fill(content);
    await this.page.locator("button[type=submit]").click();
    await expect(this.getNote(content)).toBeVisible();
  }

  async expectPosted(content: string) {
    await this.goto("/");
    await expect(this.getNote(content)).toBeVisible();
  }

  async delete(content: string) {
    await this.goto("/");
    await this.getNote(content)
      .locator("button", { has: this.page.locator(".fa-ellipsis-h") })
      .click();
    await this.page.locator("a", { hasText: "削除" }).first().click();
    await this.page.locator("button", { hasText: "削除" }).click();
  }

  async expectDeleted(content: string) {
    await this.goto("/");
    await expect(this.getNote(content)).not.toBeVisible();
  }

  async like(content: string) {
    await this.goto("/");
    await this.getNote(content)
      .locator("button", { has: this.page.locator(".fa-star") })
      .click();
  }

  async unlike(content: string) {
    await this.like(content);
  }

  async expectLiked(content: string) {
    await this.goto("/");
    await this.getNote(content).locator(".status__relative-time").click();
    await expect(this.page.locator(".detailed-status__favorites")).toHaveText(
      "1",
    );
  }

  async expectNotLiked(content: string) {
    await this.goto("/");
    await this.getNote(content).locator(".status__relative-time").click();
    await expect(this.page.locator(".detailed-status__favorites")).toHaveText(
      "0",
    );
  }

  async follow(user: string) {
    await this.goto(`/${user}`);
    await this.page.locator("button", { hasText: "フォロー" }).click();
  }

  async unfollow(user: string) {
    await this.goto(`/${user}`);
    await this.page.locator("button", { hasText: "フォロー解除" }).click();
  }

  async expectFollowing(user: string) {
    await this.goto(`/@e2e/following`);
    await expect(
      this.page.locator(".display-name__account", { hasText: user }),
    ).toBeVisible();
  }

  async expectNotFollowing(user: string) {
    await this.goto(`/@e2e/following`);
    await expect(
      this.page.locator(".display-name__account", { hasText: user }),
    ).toBeVisible();
  }

  async expectFollowed(user: string) {
    await this.goto(`/@e2e/followers`);
    await expect(
      this.page.locator(".display-name__account", { hasText: user }),
    ).toBeVisible();
  }

  async expectNotFollowed(user: string) {
    await this.goto(`/@e2e/followers`);
    await expect(
      this.page.locator(".display-name__account", { hasText: user }),
    ).not.toBeVisible();
  }
}
