import type { Locator, Page } from "@playwright/test";

export abstract class FediversePage {
  constructor(public page: Page) {}
  async goto(to: string) {
    await this.page.goto(to);
  }
  abstract login(): Promise<void>;
  abstract postNote(content: string): Promise<Locator>;
}
