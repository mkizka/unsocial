import { expect, type Locator, type Page } from "@playwright/test";

export abstract class FediverseHandler {
  abstract domain: string;
  abstract user: string;

  constructor(public page: Page) {}

  async goto(url: string) {
    const nextUrl = new URL(url, `https://${this.domain}`).toString();
    if (this.page.url() === nextUrl) {
      await this.page.reload();
    } else {
      await this.page.goto(nextUrl, { waitUntil: "networkidle" });
    }
  }

  abstract getNote(content: string): Locator;

  abstract login(): Promise<void>;

  protected abstract expectedUser(user: string): Promise<void>;

  async waitForUser(user: string) {
    await expect(() => this.expectedUser(user)).toPass();
  }

  abstract postNote(content: string): Promise<void>;

  protected abstract expectPosted(content: string): Promise<void>;

  async waitForPosted(content: string) {
    await expect(() => this.expectPosted(content)).toPass();
  }

  abstract delete(content: string): Promise<void>;

  protected abstract expectDeleted(content: string): Promise<void>;

  async waitForDeleted(content: string) {
    await expect(() => this.expectDeleted(content)).toPass();
  }

  abstract like(content: string): Promise<void>;

  abstract unlike(content: string): Promise<void>;

  protected abstract expectLiked(content: string, user: string): Promise<void>;

  async waitForLiked(content: string, user: string) {
    await expect(() => this.expectLiked(content, user)).toPass();
  }

  protected abstract expectNotLiked(
    content: string,
    user: string,
  ): Promise<void>;

  async waitForNotLiked(content: string, user: string) {
    await expect(() => this.expectNotLiked(content, user)).toPass();
  }

  abstract follow(user: string): Promise<void>;

  abstract unfollow(user: string): Promise<void>;

  protected abstract expectFollowing(user: string): Promise<void>;

  async waitForFollowing(user: string) {
    await expect(() => this.expectFollowing(user)).toPass();
  }

  protected abstract expectNotFollowing(user: string): Promise<void>;

  async waitForNotFollowing(user: string) {
    await expect(() => this.expectNotFollowing(user)).toPass();
  }

  protected abstract expectFollowed(user: string): Promise<void>;

  async waitForFollowed(user: string) {
    await expect(() => this.expectFollowed(user)).toPass();
  }

  protected abstract expectNotFollowed(user: string): Promise<void>;

  async waitForNotFollowed(user: string) {
    await expect(() => this.expectNotFollowed(user)).toPass();
  }
}
