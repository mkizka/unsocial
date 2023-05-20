import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";

import { FediversePage } from "./base";

export class MisskeyPage extends FediversePage {
  async goto(to: string) {
    await expect(async () => {
      await this.page.goto(new URL(to, "https://misskey.localhost").toString());
      await expect(this.page.locator(".top")).toBeVisible();
      await expect(this.page.locator("text=再試行")).not.toBeVisible();
    }).toPass();
  }

  async login() {
    await this.page.goto("https://misskey.localhost");
    // まれにローディングが終わらないことがあるのでタイムアウトを短めに
    // IndexedDBが原因っぽいが対処法が分からず
    await this.page.locator("[data-cy-signin]").click({ timeout: 3000 });
    await this.page.locator("[data-cy-signin-username] input").fill("e2e");
    await this.page.locator("[data-cy-signin-password] input").fill("e2e");
    await this.page.locator("button[type=submit]").click();
    await expect(this.page.locator(".account")).toBeVisible();
  }

  async postNote(content: string) {
    await this.page.locator("[data-cy-open-post-form]").click();
    await this.page.locator("[data-cy-post-form-text]").fill(content);
    await this.page.locator("[data-cy-open-post-form-submit]").click();
    const note = this.page.locator(`text=${content}`);
    await expect(note).toBeVisible();
    return note;
  }

  async delete(note: Locator) {
    await note
      .locator("button", { has: this.page.locator(".ti-dots") })
      .click();
    await this.page.locator("button", { hasText: "削除" }).last().click();
    await this.page.locator("button", { hasText: "OK" }).click();
    await this.waitForFederation();
  }

  async like(note: Locator) {
    await note
      .locator("button", { has: this.page.locator(".ti-plus") })
      .click();
    await this.page.locator(".emojis button").first().click();
    await this.waitForFederation();
  }

  async showGTL() {
    await this.goto("/");
    await this.page.locator("button", { hasText: "グローバル" }).click();
  }
}
