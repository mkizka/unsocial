import { expect } from "@playwright/test";

import { FediverseHandler } from "./base";

export class MisskeyHandler extends FediverseHandler {
  domain = "misskey.localhost";
  user = "@test@misskey.localhost";

  async goto(to: string) {
    await super.goto(to);
    // 最初に表示されるスプラッシュ(ローディング)画面が消えるまで待つ
    await expect(this.page.locator("#misskey_app")).toBeVisible();
    // 表示された画面がエラー画面でない
    await expect(
      this.page.locator("text=An error has occurred!"),
    ).not.toBeVisible();
    // 表示された画面に再試行ボタンがない
    await expect(this.page.locator("text=再試行")).not.toBeVisible();
  }

  async gotoGTL() {
    await this.goto("/");
    await this.page
      .locator("button", {
        has: this.page.locator(".ti-whirl"),
      })
      .click();
    // ローディングUIを待つ
    await expect(async () => {
      await expect(
        this.page.locator("[data-sticky-container-header-height] svg"),
      ).not.toBeVisible();
    }).toPass();
  }

  async login() {
    await this.goto("/");
    // 寄付の募集がノートよりも前面に出てクリックできなくなるので非表示にする
    await this.page.evaluate(() =>
      localStorage.setItem("neverShowDonationInfo", "true"),
    );
    await this.page.locator("[data-cy-signin]").click();
    await this.page.locator("[data-cy-signin-username] input").fill("test");
    await this.page.locator("[data-cy-signin-password] input").fill("password");
    await this.page.locator("button[type=submit]").click();
    await expect(this.page.locator("text=@test")).toBeVisible();
  }

  async expectedUser(user: string) {
    await this.goto(`/${user}`);
    await expect(this.page.locator(`text=${user}`).first()).toBeVisible();
  }

  getNote(content: string) {
    return this.page.locator("article", { hasText: content });
  }

  async postNote(content: string) {
    await this.gotoGTL();
    await this.page.locator("[data-cy-open-post-form]").click();
    await this.page.locator("[data-cy-post-form-text]").fill(content);
    await this.page.locator("[data-cy-open-post-form-submit]").click();
    await expect(this.getNote(content)).toBeVisible();
  }

  async expectPosted(content: string) {
    await this.gotoGTL();
    await expect(this.getNote(content)).toBeVisible();
  }

  async postReply(content: string, replyTo: string) {
    await this.gotoGTL();
    await this.getNote(replyTo)
      .locator("button", { has: this.page.locator(".ti-arrow-back-up") })
      .click();
    await this.page.locator("[data-cy-post-form-text]").fill(content);
    await this.page.locator("[data-cy-open-post-form-submit]").click();
    await expect(this.getNote(content)).toBeVisible();
  }

  async expectReplied(content: string, replyTo: string) {
    await this.gotoGTL();
    await this.getNote(replyTo).locator("time").click();
    await expect(this.getNote(content)).toBeVisible();
  }

  async delete(content: string) {
    await this.gotoGTL();
    await this.getNote(content)
      .locator("button", { has: this.page.locator(".ti-dots") })
      .click();
    await this.page.locator("button", { hasText: "削除" }).last().click();
    await this.page.locator("button", { hasText: "OK" }).click();
  }

  async expectDeleted(content: string) {
    await this.gotoGTL();
    await expect(this.getNote(content)).not.toBeVisible();
  }

  async like(content: string) {
    await this.gotoGTL();
    await this.getNote(content)
      .locator("button", { has: this.page.locator(".ti-plus") })
      .click();
    await this.page.locator(".emojis button").first().click();
  }

  async unlike(content: string) {
    await this.gotoGTL();
    await this.getNote(content)
      .locator("button", { has: this.page.locator(".ti-minus") })
      .click();
  }

  async expectLiked(content: string) {
    await this.gotoGTL();
    await expect(this.getNote(content).locator("[alt=👍]")).toBeVisible();
  }

  async expectNotLiked(content: string) {
    await this.gotoGTL();
    await expect(this.getNote(content).locator("[alt=👍]")).not.toBeVisible();
  }

  async repost(content: string) {
    await this.gotoGTL();
    await this.getNote(content)
      .locator("button", { has: this.page.locator(".ti-repeat") })
      .click();
    await this.page.locator("button", { hasText: "リノート" }).click();
  }

  async undoRepost(content: string): Promise<void> {
    await this.gotoGTL();
    await this.page
      .locator("[tabindex='-1']", {
        has: this.page.locator("span", { hasText: "testがリノート" }),
      })
      .locator("button", { has: this.page.locator(".ti-dots") })
      .click();
    await this.page.locator("button", { hasText: "リノート解除" }).click();
  }

  async expectReposted(content: string) {
    await this.gotoGTL();
    await this.getNote(content).locator("time").click();
    await this.page.locator("button", { hasText: "リノート" }).click();
    // ローディングUIを待つ
    await expect(async () => {
      await expect(
        this.page.locator("[data-sticky-container-header-height] svg"),
      ).not.toBeVisible();
    }).toPass();
    await expect(this.page.locator(".empty")).not.toBeVisible();
  }

  async expectNotReposted(content: string) {
    await this.gotoGTL();
    await this.getNote(content).locator("time").click();
    await this.page.locator("button", { hasText: "リノート" }).click();
    // ローディングUIを待つ
    await expect(async () => {
      await expect(
        this.page.locator("[data-sticky-container-header-height] svg"),
      ).not.toBeVisible();
    }).toPass();
    await expect(this.page.locator(".empty")).toBeVisible();
  }

  async follow(user: string) {
    await this.goto(`/${user}`);
    await this.page.locator("button", { hasText: "フォロー" }).click();
  }

  async unfollow(user: string) {
    await this.follow(user);
    await this.page.locator("button", { hasText: "OK" }).click();
  }

  async expectFollowing(user: string) {
    await this.goto(`/@test/following`);
    await expect(this.page.locator(`text=${user}`)).toBeVisible();
  }

  async expectNotFollowing(user: string) {
    await this.goto(`/@test/following`);
    await expect(this.page.locator(`text=${user}`)).not.toBeVisible();
  }

  async expectFollowed(user: string) {
    await this.goto(`/@test/followers`);
    await expect(this.page.locator(`text=${user}`)).toBeVisible();
  }

  async expectNotFollowed(user: string) {
    await this.goto(`/@test/followers`);
    await expect(this.page.locator(`text=${user}`)).not.toBeVisible();
  }

  async registerRelayServer(relay: string) {
    await this.goto("/admin/relays");
    await this.page.locator("button", { hasText: "リレーの追加" }).click();
    await this.page.locator('[placeholder="inboxのURL"]').fill(relay);
    await this.page.locator("button", { hasText: "OK" }).click();
    await this.waitFor(async () => {
      await this.page.reload();
      await expect(this.page.locator("text=承認済み")).toBeVisible();
    });
  }
}
