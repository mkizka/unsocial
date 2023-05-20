import type { Locator, Page } from "@playwright/test";

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
  abstract delete(content: string): Promise<void>;
  abstract like(content: string): Promise<void>;
}
