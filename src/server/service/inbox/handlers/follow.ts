import crypto from "crypto";

import { followRepository } from "@/server/repository";
import { inboxFollowSchema } from "@/server/schema/follow";
import { userService } from "@/server/service";
import { env } from "@/utils/env";
import { createLogger } from "@/utils/logger";
import { relayActivityToInboxUrl } from "@/utils/relayActivity";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
  UnexpectedActivityRequestError,
} from "../errors";
import { type InboxHandler } from "./shared";

const logger = createLogger("inboxFollowService");

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedFollow = inboxFollowSchema.safeParse(activity);
  if (!parsedFollow.success) {
    return new ActivitySchemaValidationError(activity, parsedFollow.error);
  }
  const followee = await userService.findUserByActorId(
    new URL(parsedFollow.data.object),
  );
  if (!followee) {
    return new BadActivityRequestError(
      activity,
      "フォローリクエストで指定されたフォロイーが存在しませんでした",
    );
  }
  if (!followee.credential) {
    // 自ホストのユーザーなら秘密鍵を持っているはずなので、異常な動作
    return new UnexpectedActivityRequestError(
      activity,
      `フォローリクエストで指定されたフォロイー(@${followee.preferredUsername}@${followee.host})が秘密鍵を持っていませんでした`,
    );
  }
  if (!actorUser.inboxUrl) {
    // 他ホストのユーザーならinboxUrlを持っているはずなので、異常な動作
    return new UnexpectedActivityRequestError(
      activity,
      "フォローリクエストを送信したユーザーがinboxUrlを持っていませんでした",
    );
  }
  await followRepository
    .createAndAccept({
      followeeId: followee.id,
      followerId: actorUser.id,
    })
    .catch((e) => logger.warn(e));
  await relayActivityToInboxUrl({
    inboxUrl: new URL(actorUser.inboxUrl),
    sender: {
      id: followee.id,
      privateKey: followee.credential.privateKey,
    },
    activity: {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      // TODO: いいの？
      id: new URL(`https://${env.HOST}/${crypto.randomUUID()}`),
      type: "Accept",
      actor: new URL(`https://${env.HOST}/users/${followee.id}/activity`),
      object: {
        ...parsedFollow.data,
        actor: new URL(parsedFollow.data.actor),
        object: new URL(parsedFollow.data.object),
      },
    },
  });
};
