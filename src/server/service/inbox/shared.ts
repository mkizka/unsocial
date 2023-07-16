import type { User } from "@prisma/client";
import type { z } from "zod";

class InboxError extends Error {}

// 送られてきたActivityの構造をzodで検証した際のエラー
export class ActivitySchemaValidationError extends InboxError {
  constructor(activity: unknown, errors: z.ZodError<unknown>) {
    super(
      JSON.stringify({
        activity,
        errors: errors.flatten().fieldErrors,
      }),
    );
  }
}

// 送られてきたActivityの内容が不正だった場合のエラー
export class BadActivityRequestError extends InboxError {}

// 送られてきたActivityは正しかったが、受け取った側の状態が原因で処理できなかった場合のエラー
export class UnexpectedActivityRequestError extends InboxError {}

export type InboxHandler = (
  activity: unknown,
  actorUser: User,
) => Promise<InboxError | void>;

export const resolveNoteId = (objectId: URL) => {
  if (!objectId.pathname.startsWith("/notes/")) {
    return null;
  }
  return objectId.pathname.split("/")[2];
};

// export class InboxError extends Error {
//   private logger: Logger;
//   protected level: "warn" | "error" = "warn";

//   constructor(
//     message: string | object,
//     activity: unknown,
//     error?: z.ZodError<unknown>
//   ) {
//     super(JSON.stringify({ message, activity, error }));
//     this.logger = createLogger(this.name);
//   }

//   public get statusCode() {
//     return this.level === "warn" ? 400 : 500;
//   }

//   public log() {
//     this.logger[this.level](this.message);
//   }
// }
