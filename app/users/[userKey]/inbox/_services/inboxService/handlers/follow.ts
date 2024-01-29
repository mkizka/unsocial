import crypto from "crypto";

import { apReplayService } from "@/_shared/activitypub/apRelayService";
import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { userFindService } from "@/_shared/user/services/userFindService";
import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
  UnexpectedActivityRequestError,
} from "./errors";
import { type InboxHandler } from "./shared";

const logger = createLogger("inboxFollowService");

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedFollow = apSchemaService.followSchema.safeParse(activity);
  if (!parsedFollow.success) {
    return new ActivitySchemaValidationError(parsedFollow.error);
  }
  const followee = await userFindService.findOrFetchUserByActor(
    parsedFollow.data.object,
  );
  if (followee instanceof Error) {
    return new BadActivityRequestError(
      "フォローリクエストで指定されたフォロイーが存在しませんでした",
    );
  }
  if (!actorUser.inboxUrl) {
    // 他ホストのユーザーならinboxUrlを持っているはずなので、異常な動作
    return new UnexpectedActivityRequestError(
      "フォローリクエストを送信したユーザーがinboxUrlを持っていませんでした",
    );
  }
  await prisma.follow.create({
    data: {
      followeeId: followee.id,
      followerId: actorUser.id,
      status: "ACCEPTED",
    },
  });
  await apReplayService.relayActivityToInboxUrl({
    userId: followee.id,
    inboxUrl: new URL(actorUser.inboxUrl),
    activity: {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      // TODO: いいの？
      id: `https://${env.UNSOCIAL_HOST}/${crypto.randomUUID()}`,
      type: "Accept",
      actor: `https://${env.UNSOCIAL_HOST}/users/${followee.id}/activity`,
      object: {
        ...parsedFollow.data,
        actor: parsedFollow.data.actor,
        object: parsedFollow.data.object,
      },
    },
  });
};
