import type { Locator, Page } from "@playwright/test";

export abstract class FediversePage {
  abstract user: string;

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

  abstract expectPosted(content: string): Promise<void>;

  abstract delete(content: string): Promise<void>;

  abstract expectDeleted(content: string): Promise<void>;

  abstract like(content: string): Promise<void>;

  abstract expectLiked(content: string): Promise<void>;

  abstract follow(user: string): Promise<void>;

  abstract expectFollowing(user: string): Promise<void>;

  abstract expectFollowed(user: string): Promise<void>;

  abstract expectNotFollowed(user: string): Promise<void>;
}
