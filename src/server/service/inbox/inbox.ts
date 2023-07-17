import { z } from "zod";

import { verifyActivity } from "@/utils/httpSignature/verify";

import { userService } from "..";
import * as inboxAcceptService from "./accept";
import * as inboxCreateService from "./create";
import * as inboxDeleteService from "./delete";
import * as inboxFollowService from "./follow";
import * as inboxLikeService from "./like";
import type { InboxHandler } from "./shared";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./shared";
import * as inboxUndoService from "./undo";

const inboxFn = {
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
    type: z.enum(keysOf(inboxFn)),
    actor: z.string().url(),
  })
  .passthrough();

const handle: InboxHandler = async (activity, actorUser) => {
  const parsedActivity = anyActivitySchema.safeParse(activity);
  if (!parsedActivity.success) {
    return new ActivitySchemaValidationError(activity, parsedActivity.error);
  }
  await inboxFn[parsedActivity.data.type].handle(
    parsedActivity.data,
    actorUser,
  );
};

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
    return new ActivitySchemaValidationError(activity, parsedActivity.error);
  }
  const actorUser = await userService.findOrFetchUserByActorId(
    new URL(parsedActivity.data.actor),
  );
  if (!actorUser) {
    return new BadActivityRequestError(
      "actorで指定されたユーザーが見つかりませんでした",
    );
  }
  // TODO: Userの公開鍵を必須にする
  const validation = verifyActivity(pathname, headers, actorUser.publicKey!);
  if (!validation.isValid) {
    return new BadActivityRequestError(
      "リクエストヘッダの署名が不正でした: " + validation.reason,
    );
  }
  return handle(parsedActivity.data, actorUser);
};
