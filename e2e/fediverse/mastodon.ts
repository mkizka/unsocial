import { expect } from "@playwright/test";

import { FediverseHandler } from "./base";

export class MastodonHandler extends FediverseHandler {
  domain = "mastodon.localhost";
  user = "@e2e@mastodon.localhost";

  async loginAs(email: string, password: string) {
    await this.goto("/");
    await this.page
      .locator(".sign-in-banner")
      .locator("a", { hasText: "ログイン" })
      .click();
    await this.page.locator("#user_email").fill(email);
    await this.page.locator("#user_password").fill(password);
    await this.page.locator("button").click();
    await expect(
      this.page.locator(".navigation-bar__profile-account"),
    ).toBeVisible();
  }

  async login() {
    await this.loginAs("e2e@localhost", "password");
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
    return this.page.locator(".status", { hasText: content });
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

  async postReply(content: string, replyTo: string) {
    await this.goto("/");
    await this.getNote(replyTo)
      .locator("button", { has: this.page.locator(".fa-reply") })
      .click();
    await this.page.locator(".autosuggest-textarea__textarea").fill(content);
    await this.page.locator("button[type=submit]").click();
    await expect(this.getNote(content)).toBeVisible();
  }

  protected async expectReplied(content: string, replyTo: string) {
    await this.goto("/");
    await this.getNote(replyTo).locator(".status__relative-time").click();
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

  async repost(content: string) {
    await this.goto("/");
    await this.getNote(content)
      .locator("button", { has: this.page.locator(".fa-retweet") })
      .click();
  }

  async undoRepost(content: string): Promise<void> {
    await this.repost(content);
  }

  async expectReposted(content: string) {
    await this.goto("/");
    await this.getNote(content).locator(".status__relative-time").click();
    await expect(this.page.locator(".detailed-status__reblogs")).toHaveText(
      "1",
    );
  }

  async follow(user: string) {
    await this.goto(`/${user}`);
    await this.page.locator("button", { hasText: "フォロー" }).click();
  }

  async unfollow(user: string) {
    await this.goto(`/${user}`);
    await this.page.locator("button", { hasText: "フォロー解除" }).click();
    await this.page
      .locator(".confirmation-modal__action-bar button", {
        hasText: "フォロー解除",
      })
      .click();
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
    ).not.toBeVisible();
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

  async logout() {
    await this.goto("/settings/profile");
    await this.page.locator("#logout").locator("a").click();
  }

  async deleteAccount() {
    await this.loginAs("delete@localhost", "password");
    await this.goto("/settings/delete");
    await this.page
      .locator("#form_delete_confirmation_password")
      .fill("password");
    await this.page
      .locator("#new_form_delete_confirmation")
      .locator("button")
      .click();
  }
}
