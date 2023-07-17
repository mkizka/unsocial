import { z } from "zod";

import { verifyActivity } from "@/utils/httpSignature/verify";

import { userService } from "..";
import * as inboxAcceptService from "./accept";
import * as inboxCreateService from "./create";
import * as inboxDeleteService from "./delete";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./errors";
import * as inboxFollowService from "./follow";
import * as inboxLikeService from "./like";
import * as inboxUndoService from "./undo";

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
    return new ActivitySchemaValidationError(activity, parsedActivity.error);
  }
  const actorUser = await userService.findOrFetchUserByActorId(
    new URL(parsedActivity.data.actor),
  );
  if (!actorUser) {
    return new BadActivityRequestError(
      activity,
      "actorで指定されたユーザーが見つかりませんでした",
    );
  }
  // TODO: Userの公開鍵を必須にする
  const validation = verifyActivity(pathname, headers, actorUser.publicKey!);
  if (!validation.isValid) {
    return new BadActivityRequestError(
      activity,
      "リクエストヘッダの署名が不正でした: " + validation.reason,
    );
  }
  return inboxServices[parsedActivity.data.type].handle(
    parsedActivity.data,
    actorUser,
  );
};
