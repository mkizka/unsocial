import crypto from "crypto";

import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { userFindService } from "@/_shared/service/user";
import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";
import { relayActivityToInboxUrl } from "@/_shared/utils/relayActivity";

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
    return new ActivitySchemaValidationError(parsedFollow.error, activity);
  }
  const followee = await userFindService.findOrFetchUserByActor(
    parsedFollow.data.object,
  );
  if (followee instanceof Error) {
    return new BadActivityRequestError(
      "フォローリクエストで指定されたフォロイーが存在しませんでした",
      activity,
    );
  }
  if (!actorUser.inboxUrl) {
    // 他ホストのユーザーならinboxUrlを持っているはずなので、異常な動作
    return new UnexpectedActivityRequestError(
      "フォローリクエストを送信したユーザーがinboxUrlを持っていませんでした",
      activity,
    );
  }
  await prisma.follow.create({
    data: {
      followeeId: followee.id,
      followerId: actorUser.id,
      status: "ACCEPTED",
    },
  });
  await relayActivityToInboxUrl({
    userId: followee.id,
    inboxUrl: new URL(actorUser.inboxUrl),
    activity: {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      // TODO: いいの？
      id: new URL(`https://${env.UNSOCIAL_HOST}/${crypto.randomUUID()}`),
      type: "Accept",
      actor: new URL(
        `https://${env.UNSOCIAL_HOST}/users/${followee.id}/activity`,
      ),
      object: {
        ...parsedFollow.data,
        actor: new URL(parsedFollow.data.actor),
        object: new URL(parsedFollow.data.object),
      },
    },
  });
};
