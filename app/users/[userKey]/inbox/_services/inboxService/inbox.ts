import type { NextRequest } from "next/server";
import { z } from "zod";

import { httpSignatureVerifyService } from "@/_shared/activitypub/httpSignatureVerifyService";
import { userFindService } from "@/_shared/user/services/userFindService";
import { createLogger } from "@/_shared/utils/logger";

import * as inboxAcceptService from "./handlers/accept";
import * as inboxAnnounceService from "./handlers/announce";
import * as inboxCreateService from "./handlers/create";
import * as inboxDeleteService from "./handlers/delete";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./handlers/errors";
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
  const validation = await httpSignatureVerifyService.verifyRequest(request);
  if (!validation.isValid) {
    return new BadActivityRequestError(
      "リクエストヘッダの署名が不正でした: " + validation.reason,
    );
  }

  // 2. Activityのスキーマを検証する
  const parsedActivity = anyActivitySchema.safeParse(activity);
  if (!parsedActivity.success) {
    return new ActivitySchemaValidationError(parsedActivity.error);
  }

  // 3. actorで指定されたユーザーを取得する
  const actorUser = await userFindService.findOrFetchUserByActor(
    parsedActivity.data.actor,
  );
  // TODO actorUserのエラーを使ってログを出す
  if (actorUser instanceof Error) {
    return new BadActivityRequestError(
      "actorで指定されたユーザーが見つかりませんでした",
    );
  }

  // 4. ハンドラーを呼び出す
  return inboxServices[parsedActivity.data.type].handle(
    parsedActivity.data,
    actorUser,
  );
};