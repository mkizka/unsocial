import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";

import { FediversePage } from "./base";

export class SoshalPage extends FediversePage {
  async login() {
    // まれに /api/auth/signin?csrf=true にリダイレクトされることがあるのでリトライ
    await expect(async () => {
      await this.page.goto("/");
      await this.page.locator("[data-testid=login-button]").click();
      await this.page.waitForURL((url) => url.pathname != "/");
      expect(this.page.url()).toContain("/api/auth/verify-request");
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

  async postNote(content: string) {
    await this.page.getByTestId("note-form__textarea").fill(content);
    await this.page.getByTestId("note-form__button").click();
    const note = this.page.locator("[data-testid=note-card]", {
      hasText: content,
    });
    await expect(note).toBeVisible();
    return note;
  }

  async delete(note: Locator) {
    await note.getByTestId("delete-button").click();
    await this.waitForFederation();
  }

  async like(note: Locator) {
    await note.getByTestId("like-button").click();
    await this.waitForFederation();
  }
}
