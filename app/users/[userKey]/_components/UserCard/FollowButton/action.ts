"use server";
import { revalidatePath } from "next/cache";

import { activityStreams } from "@/_shared/utils/activitypub";
import { env } from "@/_shared/utils/env";
import { getSessionUserId } from "@/_shared/utils/getSessionUser";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";
import { relayActivityToInboxUrl } from "@/_shared/utils/relayActivity";

const logger = createLogger("FollowButton");

const follow = async (userId: string, followeeId: string) => {
  const follow = await prisma.follow.create({
    data: {
      followeeId: followeeId,
      followerId: userId,
      status: "SENT",
    },
    include: {
      followee: true,
    },
  });
  if (follow.followee.host !== env.HOST) {
    if (!follow.followee.actorUrl) {
      logger.error("フォロー先のURLがありません");
      return;
    }
    if (!follow.followee.inboxUrl) {
      logger.error("フォロー先のinboxUrlがありません");
      return;
    }
    await relayActivityToInboxUrl({
      userId,
      inboxUrl: new URL(follow.followee.inboxUrl),
      activity: activityStreams.follow(follow, follow.followee.actorUrl),
    });
  } else {
    await prisma.follow.update({
      where: { id: follow.id },
      data: { status: "ACCEPTED" },
    });
  }
};

const unfollow = async (userId: string, followeeId: string) => {
  const follow = await prisma.follow.delete({
    where: {
      followeeId_followerId: {
        followeeId: followeeId,
        followerId: userId,
      },
    },
    include: {
      followee: true,
    },
  });
  if (follow.followee.host !== env.HOST) {
    if (!follow.followee.actorUrl) {
      logger.error("フォロー先のURLがありません");
      return;
    }
    if (!follow.followee.inboxUrl) {
      logger.error("フォロー先のinboxUrlがありません");
      return;
    }
    await relayActivityToInboxUrl({
      userId,
      inboxUrl: new URL(follow.followee.inboxUrl),
      activity: activityStreams.undo(
        activityStreams.follow(follow, follow.followee.actorUrl),
      ),
    });
  }
};

export async function action({ followeeId }: { followeeId: string }) {
  const userId = await getSessionUserId({ redirect: true });
  const existingFollow = await prisma.follow.findFirst({
    where: {
      followeeId: followeeId,
      followerId: userId,
    },
  });
  if (existingFollow) {
    await unfollow(userId, followeeId);
  } else {
    await follow(userId, followeeId);
  }
  revalidatePath(`/users/${followeeId}`);
}
