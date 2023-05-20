import type { Locator, Page } from "@playwright/test";

import { expect } from "./fixtures";

export abstract class FediversePage {
  constructor(public page: Page) {}
  async goto(to: string) {
    await this.page.goto(to);
  }
  async waitForFederation() {
    await this.page.waitForTimeout(500);
  }
  abstract getNote(content: string): Locator;
  abstract login(): Promise<void>;
  abstract postNote(content: string): Promise<void>;
  async expectPosted(content: string) {
    await expect(this.getNote(content)).toBeVisible();
  }
  abstract delete(content: string): Promise<void>;
  async expectDeleted(content: string) {
    await expect(this.getNote(content)).not.toBeVisible();
  }
  abstract like(content: string): Promise<void>;
  abstract expectLiked(content: string): Promise<void>;
  abstract follow(content: string): Promise<void>;
}
