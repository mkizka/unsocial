import { expect } from "@playwright/test";

import { FediverseHandler } from "./base";

export class MyhostUnsocialHandler extends FediverseHandler {
  domain = "unsocial.localhost";
  user = "@test@unsocial.localhost";

  async login() {
    await this.goto("/auth");
    await this.page
      .getByTestId("auth-form__input-preferredUsername")
      .fill("test");
    await this.page.getByTestId("auth-form__input-password").fill("testtest");
    await this.page.getByTestId("auth-form__button").click();
    await expect(this.page.getByTestId("user-menu")).toBeVisible();
  }

  async expectedUser(user: string) {
    await this.goto(`/${user}`);
    await expect(this.page.locator(`text=${user}`).first()).toBeVisible();
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

  async postReply(content: string, replyTo: string) {
    await this.goto("/");
    await this.getNote(replyTo).getByTestId("note-card__reply").click();
    await this.page.waitForURL((url) => url.pathname.startsWith("/notes/"));
    await this.page.getByTestId("note-form__textarea").fill(content);
    await this.page.getByTestId("note-form__button").click();
    await expect(this.getNote(content)).toBeVisible();
  }

  protected async expectReplied(content: string, replyTo: string) {
    await this.goto("/");
    await this.getNote(replyTo).getByTestId("note-card__link").click();
    await this.page.waitForURL((url) => url.pathname.startsWith("/notes/"));
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

  async unlike(content: string) {
    await this.like(content);
  }

  async expectLiked(content: string, user: string) {
    await this.goto("/");
    await this.getNote(content).getByTestId("note-card__link").click();
    await this.page.waitForURL((url) => url.pathname.startsWith("/notes/"));
    await expect(
      this.page.locator("[data-testid=like-user]", { hasText: user }),
    ).toBeVisible();
  }

  async expectNotLiked(content: string, user: string) {
    await this.goto("/");
    await this.getNote(content).getByTestId("note-card__link").click();
    await this.page.waitForURL((url) => url.pathname.startsWith("/notes/"));
    await expect(
      this.page.locator("[data-testid=like-user]", { hasText: user }),
    ).not.toBeVisible();
  }

  async repost(content: string) {
    await this.goto("/");
    await this.getNote(content).getByTestId("repost-button").click();
  }

  async undoRepost(content: string): Promise<void> {
    await this.repost(content);
  }

  async expectReposted(content: string) {
    await this.goto("/");
    await expect(
      this.page.locator("[data-testid=reposted-note-card]", {
        hasText: content,
      }),
    ).toBeVisible();
  }

  async expectNotReposted(content: string) {
    await this.goto("/");
    await expect(
      this.page.locator("[data-testid=reposted-note-card]", {
        hasText: content,
      }),
    ).not.toBeVisible();
  }

  async follow(user: string) {
    await this.goto(`/${user}`);
    await this.page.getByTestId("follow-button").click();
  }

  async unfollow(user: string) {
    await this.follow(user);
  }

  async expectFollowing(user: string) {
    await this.goto(`/${this.user}/followees`);
    await expect(this.page.getByTestId("user-followees")).toHaveText(
      "1フォロー",
    );
    await expect(this.page.locator(`text=${user}`)).toBeVisible();
  }

  async expectNotFollowing(user: string) {
    await this.goto(`/${this.user}/followees`);
    await expect(this.page.getByTestId("user-followees")).toHaveText(
      "0フォロー",
    );
    await expect(this.page.locator(`text=${user}`)).not.toBeVisible();
  }

  async expectFollowed(user: string) {
    await this.goto(`/${this.user}/followers`);
    await expect(this.page.getByTestId("user-followers")).toHaveText(
      "1フォロワー",
    );
    await expect(this.page.locator(`text=${user}`)).toBeVisible();
  }

  async expectNotFollowed(user: string) {
    await this.goto(`/${this.user}/followers`);
    await expect(this.page.getByTestId("user-followers")).toHaveText(
      "0フォロワー",
    );
    await expect(this.page.locator(`text=${user}`)).not.toBeVisible();
  }
}

export class RemoteUnsocialHandler extends MyhostUnsocialHandler {
  domain = "remote.localhost";
  user = "@test@remote.localhost";
}
