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
    //
  }

  getNote(content: string) {
    return this.page.locator("article", { hasText: content });
  }

  async postNote(content: string) {
    //
  }

  async expectPosted(content: string) {
    //
  }

  async delete(content: string) {
    //
  }

  async expectDeleted(content: string) {
    //
  }

  async like(content: string) {
    //
  }

  async expectLiked(content: string) {
    //
  }

  async follow(user: string) {
    //
  }

  async unfollow(user: string) {
    //
  }

  async expectFollowing(user: string) {
    //
  }

  async expectFollowed(user: string) {
    //
  }

  async expectNotFollowed(user: string) {
    //
  }
}
