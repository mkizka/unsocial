import type { z } from "zod";
import { fromZodError } from "zod-validation-error";

type ErrorLevel = "info" | "warn" | "error";

export class InboxError extends Error {
  public level: ErrorLevel = "warn";
  constructor(message: string, level?: ErrorLevel) {
    super(message);
    if (level) {
      this.level = level;
    }
  }
}

// 送られてきたActivityの構造をzodで検証した際のエラー
export class ActivitySchemaValidationError<T> extends InboxError {
  constructor(errors: z.ZodError<T>, level?: ErrorLevel) {
    super(fromZodError(errors).toString(), level);
  }
}

// 送られてきたActivityの内容が不正だった場合のエラー
export class BadActivityRequestError extends InboxError {}

// 送られてきたActivityは正しかったが、自サーバーの実装や状態が原因で処理できなかった場合のエラー
export class UnexpectedActivityRequestError extends InboxError {
  public level: ErrorLevel = "error";
}
