import type { z } from "zod";

export class InboxError extends Error {
  public level: "warn" | "error" = "warn";
  public statusCode: number = 400;

  constructor(activity: unknown, message: string | object) {
    super();
    this.message = JSON.stringify({ name: this.name, activity, message });
  }
}

// 送られてきたActivityの構造をzodで検証した際のエラー
export class ActivitySchemaValidationError extends InboxError {
  constructor(activity: unknown, error: z.ZodError<unknown>) {
    super(activity, error);
  }
}

// 送られてきたActivityの内容が不正だった場合のエラー
export class BadActivityRequestError extends InboxError {}

// 送られてきたActivityは正しかったが、自サーバーの実装や状態が原因で処理できなかった場合のエラー
export class UnexpectedActivityRequestError extends InboxError {
  public level = "error" as const;
  public statusCode = 500;
}
