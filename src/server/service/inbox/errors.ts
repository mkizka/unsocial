import type { z } from "zod";

type ZodFieldErrors = { [key in string]?: string[] };

export class InboxError extends Error {
  public level: "warn" | "error" = "warn";
  public statusCode: number = 400;

  constructor(
    private messageOrError: string | ZodFieldErrors,
    private data: unknown,
  ) {
    super();
  }

  private get payload() {
    return {
      name: this.constructor.name,
      message: this.messageOrError,
      data: this.data,
    };
  }

  public get message() {
    return JSON.stringify(this.payload);
  }

  public get messageFormatted() {
    return JSON.stringify(this.payload, null, 2);
  }
}

// 送られてきたActivityの構造をzodで検証した際のエラー
export class ActivitySchemaValidationError<T> extends InboxError {
  constructor(errors: z.ZodError<T>, data: unknown) {
    super(errors.flatten().fieldErrors, data);
  }
}

// 送られてきたActivityの内容が不正だった場合のエラー
export class BadActivityRequestError extends InboxError {}

// 送られてきたActivityは正しかったが、自サーバーの実装や状態が原因で処理できなかった場合のエラー
export class UnexpectedActivityRequestError extends InboxError {
  public level = "error" as const;
  public statusCode = 500;
}
