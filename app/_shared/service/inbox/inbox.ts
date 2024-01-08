import type { NextRequest } from "next/server";
import { z } from "zod";

import { userService } from "@/_shared/service/user";
import { verifyRequest } from "@/_shared/utils/httpSignature/verify";
import { createLogger } from "@/_shared/utils/logger";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./errors";
import * as inboxAcceptService from "./handlers/accept";
import * as inboxAnnounceService from "./handlers/announce";
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
  Announce: inboxAnnounceService,
} as const;

const keysOf = <T extends object>(obj: T) =>
  Object.keys(obj) as [keyof T, ...(keyof T)[]];

const anyActivitySchema = z
  .object({
    type: z.enum(keysOf(inboxServices)),
    actor: z.string().url(),
  })
  .passthrough();

const logger = createLogger("inboxService");

export const perform = async (request: NextRequest) => {
  const activity = await request.clone().json();
  logger.debug("Activityを受信: " + JSON.stringify(activity));

  // 1. ヘッダーの署名を検証する
  const validation = await verifyRequest(request);
  if (!validation.isValid) {
    return new BadActivityRequestError(
      "リクエストヘッダの署名が不正でした: " + validation.reason,
      { activity, headers: Object.fromEntries(request.headers) },
    );
  }

  // 2. Activityのスキーマを検証する
  const parsedActivity = anyActivitySchema.safeParse(activity);
  if (!parsedActivity.success) {
    return new ActivitySchemaValidationError(parsedActivity.error, activity);
  }

  // 3. actorで指定されたユーザーを取得する
  const actorUser = await userService.findOrFetchUserByActor(
    parsedActivity.data.actor,
  );
  // TODO actorUserのエラーを使ってログを出す
  if (actorUser instanceof Error) {
    return new BadActivityRequestError(
      "actorで指定されたユーザーが見つかりませんでした",
      activity,
    );
  }

  // 4. ハンドラーを呼び出す
  return inboxServices[parsedActivity.data.type].handle(
    parsedActivity.data,
    actorUser,
  );
};
