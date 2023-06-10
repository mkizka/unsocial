import type { Locator, Page } from "@playwright/test";

export abstract class FediverseHandler {
  abstract domain: string;
  abstract user: string;

  constructor(public page: Page) {}

  async goto(to: string) {
    await this.page.goto(new URL(to, `https://${this.domain}`).toString());
  }

  async waitForFederation() {
    await this.page.waitForTimeout(2000);
  }

  abstract getNote(content: string): Locator;

  abstract login(): Promise<void>;

  protected abstract postNote(content: string): Promise<void>;

  async postNoteAndWait(content: string) {
    await this.postNote(content);
    await this.waitForFederation();
  }

  abstract expectPosted(content: string): Promise<void>;

  protected abstract delete(content: string): Promise<void>;

  async deleteAndWait(content: string) {
    await this.delete(content);
    await this.waitForFederation();
  }

  abstract expectDeleted(content: string): Promise<void>;

  protected abstract like(content: string): Promise<void>;

  async likeAndWait(content: string) {
    await this.like(content);
    await this.waitForFederation();
  }

  abstract expectLiked(content: string, user: string): Promise<void>;

  protected abstract follow(user: string): Promise<void>;

  async followAndWait(user: string) {
    await this.follow(user);
    await this.waitForFederation();
  }

  protected abstract unfollow(user: string): Promise<void>;

  async unfollowAndWait(user: string) {
    await this.unfollow(user);
    await this.waitForFederation();
  }

  abstract expectFollowing(user: string): Promise<void>;

  abstract expectFollowed(user: string): Promise<void>;

  abstract expectNotFollowed(user: string): Promise<void>;
}
