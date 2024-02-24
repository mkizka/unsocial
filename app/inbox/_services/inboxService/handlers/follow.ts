import { apRelayService } from "@/_shared/activitypub/apRelayService";
import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { userFindService } from "@/_shared/user/services/userFindService";
import { activityStreams } from "@/_shared/utils/activitypub";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";
import { isInstanceOfPrismaError } from "@/_shared/utils/prismaError";

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
  try {
    await prisma.follow.create({
      data: {
        followeeId: followee.id,
        followerId: actorUser.id,
        status: "ACCEPTED",
      },
    });
    await apRelayService.relay({
      userId: followee.id,
      activity: activityStreams.accept(followee.id, parsedFollow.data),
      inboxUrl: actorUser.inboxUrl,
    });
  } catch (error) {
    if (isInstanceOfPrismaError(error) && error.code === "P2002") {
      logger.info(`すでに存在するフォロー関係のためスキップ`);
      return;
    }
    throw error;
  }
};
