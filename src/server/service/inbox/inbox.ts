import { z } from "zod";

import { verifyActivity } from "@/utils/httpSignature/verify";

import { userService } from "..";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./errors";
import * as inboxAcceptService from "./handlers/accept";
import * as inboxCreateService from "./handlers/create";
import * as inboxDeleteService from "./handlers/delete";
import * as inboxFollowService from "./handlers/follow";
import * as inboxLikeService from "./handlers/like";
import * as inboxUndoService from "./handlers/undo";

const inboxServices = {
  Follow: inboxFollowService,
  Accept: inboxAcceptService,
  Delete: inboxDeleteService,
  Undo: inboxUndoService,
  Create: inboxCreateService,
  Like: inboxLikeService,
} as const;

const keysOf = <T extends object>(obj: T) =>
  Object.keys(obj) as [keyof T, ...(keyof T)[]];

const anyActivitySchema = z
  .object({
    type: z.enum(keysOf(inboxServices)),
    actor: z.string().url(),
  })
  .passthrough();

type PerformParams = {
  activity: unknown;
  pathname: string;
  headers: Headers;
};

export const perform = async ({
  activity,
  pathname,
  headers,
}: PerformParams) => {
  const parsedActivity = anyActivitySchema.safeParse(activity);
  if (!parsedActivity.success) {
    return new ActivitySchemaValidationError(parsedActivity.error, activity);
  }
  const actorUser = await userService.findOrFetchUserByActorId(
    new URL(parsedActivity.data.actor),
  );
  if (!actorUser) {
    return new BadActivityRequestError(
      "actorで指定されたユーザーが見つかりませんでした",
      activity,
    );
  }
  // TODO: Userの公開鍵を必須にする
  const validation = verifyActivity(pathname, headers, actorUser.publicKey!);
  if (!validation.isValid) {
    return new BadActivityRequestError(
      "リクエストヘッダの署名が不正でした: " + validation.reason,
      { activity, headers: Object.fromEntries(headers) },
    );
  }
  return inboxServices[parsedActivity.data.type].handle(
    parsedActivity.data,
    actorUser,
  );
};
