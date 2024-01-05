import { expect, type Locator, type Page } from "@playwright/test";

export abstract class FediverseHandler {
  abstract domain: string;
  abstract user: string;

  constructor(public page: Page) {}

  async waitFor(fn: () => Promise<void>) {
    await expect(fn).toPass({ timeout: 10000 });
  }

  async goto(url: string) {
    const nextUrl = new URL(url, `https://${this.domain}`).toString();
    await this.waitFor(async () => {
      if (this.page.url() === nextUrl) {
        await this.page.reload();
      } else {
        await this.page.goto(nextUrl, { timeout: 2000 });
      }
    });
  }

  abstract getNote(content: string): Locator;

  abstract login(): Promise<void>;

  protected abstract expectedUser(user: string): Promise<void>;

  async waitForUser(user: string) {
    await this.waitFor(() => this.expectedUser(user));
  }

  abstract postNote(content: string): Promise<void>;

  protected abstract expectPosted(content: string): Promise<void>;

  async waitForPosted(content: string) {
    await this.waitFor(() => this.expectPosted(content));
  }

  abstract postReply(content: string, replyTo: string): Promise<void>;

  protected abstract expectReplied(
    content: string,
    replyTo: string,
  ): Promise<void>;

  async waitForReplied(content: string, replyTo: string) {
    await this.waitFor(() => this.expectReplied(content, replyTo));
  }

  abstract delete(content: string): Promise<void>;

  protected abstract expectDeleted(content: string): Promise<void>;

  async waitForDeleted(content: string) {
    await this.waitFor(() => this.expectDeleted(content));
  }

  abstract like(content: string): Promise<void>;

  abstract unlike(content: string): Promise<void>;

  protected abstract expectLiked(content: string, user: string): Promise<void>;

  async waitForLiked(content: string, user: string) {
    await this.waitFor(() => this.expectLiked(content, user));
  }

  protected abstract expectNotLiked(
    content: string,
    user: string,
  ): Promise<void>;

  async waitForNotLiked(content: string, user: string) {
    await this.waitFor(() => this.expectNotLiked(content, user));
  }

  abstract follow(user: string): Promise<void>;

  abstract unfollow(user: string): Promise<void>;

  protected abstract expectFollowing(user: string): Promise<void>;

  async waitForFollowing(user: string) {
    await this.waitFor(() => this.expectFollowing(user));
  }

  protected abstract expectNotFollowing(user: string): Promise<void>;

  async waitForNotFollowing(user: string) {
    await this.waitFor(() => this.expectNotFollowing(user));
  }

  protected abstract expectFollowed(user: string): Promise<void>;

  async waitForFollowed(user: string) {
    await this.waitFor(() => this.expectFollowed(user));
  }

  protected abstract expectNotFollowed(user: string): Promise<void>;

  async waitForNotFollowed(user: string) {
    await this.waitFor(() => this.expectNotFollowed(user));
  }
}
