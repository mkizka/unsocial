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
    await this.goto(`/${user}`);
    await expect(this.page.locator(`text=${user}`).first()).toBeVisible();
  }

  getNote(content: string) {
    return this.page.locator("article", { hasText: content });
  }

  async postNote(content: string) {
    throw new Error("未実装");
  }

  async expectPosted(content: string) {
    throw new Error("未実装");
  }

  async delete(content: string) {
    throw new Error("未実装");
  }

  async expectDeleted(content: string) {
    throw new Error("未実装");
  }

  async like(content: string) {
    throw new Error("未実装");
  }

  async expectLiked(content: string) {
    throw new Error("未実装");
  }

  async follow(user: string) {
    await this.goto(`/${user}`);
    await this.page.locator("button", { hasText: "フォロー" }).click();
  }

  async unfollow(user: string) {
    throw new Error("未実装");
  }

  async expectFollowing(user: string) {
    throw new Error("未実装");
  }

  async expectFollowed(user: string) {
    throw new Error("未実装");
  }

  async expectNotFollowed(user: string) {
    throw new Error("未実装");
  }
}
