import { expect } from "@playwright/test";

import { FediverseHandler } from "./base";

export class MyhostSoshalHandler extends FediverseHandler {
  domain = "soshal.localhost";
  user = "@test@soshal.localhost";

  async login() {
    await this.goto("/auth");
    await this.page.getByTestId("text-input-preferredUsername").fill("test");
    await this.page.getByTestId("password-input").fill("testtest");
    await this.page.getByTestId("submit-button").click();
    await expect(this.page.getByTestId("is-logged-in")).toBeVisible();
  }

  async expectedUser(user: string) {
    await this.goto(`/${user}`);
    await expect(this.page.locator(`text=${user}`)).toBeVisible();
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

  async expectLiked(content: string, user: string) {
    await this.goto("/");
    await this.getNote(content).getByTestId("note-card__link").click();
    await this.page.waitForURL((url) => url.pathname.startsWith("/notes/"));
    await expect(this.page.locator(`text=${user}`)).toBeVisible();
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
    await this.goto("/");
  }

  async expectNotFollowed(user: string) {
    // TODO: フォロワー一覧を実装したら実装
    await this.goto("/");
  }
}

export class RemoteSoshalHandler extends MyhostSoshalHandler {
  domain = "remote.localhost";
  user = "@test@remote.localhost";
}
