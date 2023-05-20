import type { Locator, Page } from "@playwright/test";

export abstract class FediversePage {
  constructor(public page: Page) {}
  async goto(to: string) {
    await this.page.goto(to);
  }
  async waitForFederation() {
    await this.page.waitForTimeout(500);
  }
  abstract login(): Promise<void>;
  abstract postNote(content: string): Promise<Locator>;
  abstract delete(note: Locator): Promise<void>;
  abstract like(note: Locator): Promise<void>;
}
