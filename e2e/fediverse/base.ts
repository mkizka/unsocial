import { expect, type Locator, type Page } from "@playwright/test";

const waitFor = async (fn: () => Promise<void>) => {
  await expect(fn).toPass({ timeout: 4000 });
};

export abstract class FediverseHandler {
  abstract domain: string;
  abstract user: string;

  constructor(public page: Page) {}

  async goto(url: string) {
    const nextUrl = new URL(url, `https://${this.domain}`).toString();
    await waitFor(async () => {
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
    await waitFor(() => this.expectedUser(user));
  }

  abstract postNote(content: string): Promise<void>;

  protected abstract expectPosted(content: string): Promise<void>;

  async waitForPosted(content: string) {
    await waitFor(() => this.expectPosted(content));
  }

  abstract postReply(content: string, replyTo: string): Promise<void>;

  protected abstract expectReplied(
    content: string,
    replyTo: string,
  ): Promise<void>;

  abstract delete(content: string): Promise<void>;

  protected abstract expectDeleted(content: string): Promise<void>;

  async waitForDeleted(content: string) {
    await waitFor(() => this.expectDeleted(content));
  }

  abstract like(content: string): Promise<void>;

  abstract unlike(content: string): Promise<void>;

  protected abstract expectLiked(content: string, user: string): Promise<void>;

  async waitForLiked(content: string, user: string) {
    await waitFor(() => this.expectLiked(content, user));
  }

  protected abstract expectNotLiked(
    content: string,
    user: string,
  ): Promise<void>;

  async waitForNotLiked(content: string, user: string) {
    await waitFor(() => this.expectNotLiked(content, user));
  }

  abstract follow(user: string): Promise<void>;

  abstract unfollow(user: string): Promise<void>;

  protected abstract expectFollowing(user: string): Promise<void>;

  async waitForFollowing(user: string) {
    await waitFor(() => this.expectFollowing(user));
  }

  protected abstract expectNotFollowing(user: string): Promise<void>;

  async waitForNotFollowing(user: string) {
    await waitFor(() => this.expectNotFollowing(user));
  }

  protected abstract expectFollowed(user: string): Promise<void>;

  async waitForFollowed(user: string) {
    await waitFor(() => this.expectFollowed(user));
  }

  protected abstract expectNotFollowed(user: string): Promise<void>;

  async waitForNotFollowed(user: string) {
    await waitFor(() => this.expectNotFollowed(user));
  }
}
