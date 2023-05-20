import { expect } from "@playwright/test";

import { FediversePage } from "./base";

export class MisskeyPage extends FediversePage {
  user = "@e2e@misskey.localhost";

  async goto(to: string) {
    await expect(async () => {
      await this.page.goto(new URL(to, "https://misskey.localhost").toString());
      // 最初に表示されるスプラッシュ(ローディング)画面
      await expect(this.page.locator("#splash")).not.toBeVisible();
      // なんらかのエラーが発生した時の再試行ボタン
      await expect(this.page.locator("text=再試行")).not.toBeVisible();
    }).toPass();
    if (to == "/") {
      await this.page
        .locator("button", {
          has: this.page.locator(".ti-whirl"),
        })
        .click();
    }
  }

  async login() {
    await this.page.goto("https://misskey.localhost");
    await this.page.locator("[data-cy-signin]").click();
    await this.page.locator("[data-cy-signin-username] input").fill("e2e");
    await this.page.locator("[data-cy-signin-password] input").fill("e2e");
    await this.page.locator("button[type=submit]").click();
    await expect(this.page.locator(".account")).toBeVisible();
  }

  getNote(content: string) {
    return this.page.locator("article", { hasText: content });
  }

  async postNote(content: string) {
    await this.goto("/");
    await this.page.locator("[data-cy-open-post-form]").click();
    await this.page.locator("[data-cy-post-form-text]").fill(content);
    await this.page.locator("[data-cy-open-post-form-submit]").click();
    await expect(this.getNote(content)).toBeVisible();
    await this.waitForFederation();
  }

  async delete(content: string) {
    await this.goto("/");
    await this.getNote(content)
      .locator("button", { has: this.page.locator(".ti-dots") })
      .click();
    await this.page.locator("button", { hasText: "削除" }).last().click();
    await this.page.locator("button", { hasText: "OK" }).click();
    await this.waitForFederation();
  }

  async like(content: string) {
    await this.goto("/");
    await this.getNote(content)
      .locator("button", { has: this.page.locator(".ti-plus") })
      .click();
    await this.page.locator(".emojis button").first().click();
    await this.waitForFederation();
  }

  async expectLiked(content: string) {
    await expect(
      this.getNote(content).locator("button", { hasText: "1" })
    ).toBeVisible();
  }

  async follow(user: string) {
    // TODO: 実装
  }

  async expectFollowing(user: string) {
    // TODO: 実装
  }

  async expectFollowed(user: string) {
    await this.goto(`/@e2e/followers`);
    await expect(this.page.locator(`text=${user}`)).toBeVisible();
  }

  async expectNotFollowed(user: string) {
    await this.goto(`/@e2e/followers`);
    await expect(this.page.locator(`text=${user}`)).not.toBeVisible();
  }
}
