import { followRepository } from "@/server/repository";
import { followSchema } from "@/server/schema";
import { userService } from "@/server/service";
import { env } from "@/utils/env";
import { createLogger } from "@/utils/logger";
import { relayActivityToInboxUrl } from "@/utils/relayActivity";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
  type InboxHandler,
  UnexpectedActivityRequestError,
} from "./shared";

export const name = "followService";

const logger = createLogger(name);

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedFollow = followSchema.safeParse(activity);
  if (!parsedFollow.success) {
    return new ActivitySchemaValidationError(activity, parsedFollow.error);
  }
  const followee = await userService.findUserByActorId(
    new URL(parsedFollow.data.object),
  );
  if (!followee) {
    return new BadActivityRequestError(
      "フォローリクエストで指定されたフォロイーが存在しませんでした",
    );
  }
  if (!followee.privateKey) {
    // 自ホストのユーザーなら秘密鍵を持っているはずなので、異常な動作
    return new UnexpectedActivityRequestError(
      `フォローリクエストで指定されたフォロイー(@${followee.preferredUsername}@${followee.host})が秘密鍵を持っていませんでした`,
    );
  }
  if (!actorUser.inboxUrl) {
    // 他ホストのユーザーならinboxUrlを持っているはずなので、異常な動作
    return new UnexpectedActivityRequestError(
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
      privateKey: followee.privateKey,
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
