"use server";
import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";

import { activityStreams } from "@/utils/activitypub";
import { env } from "@/utils/env";
import { getServerSession } from "@/utils/getServerSession";
import { createLogger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";
import { relayActivityToInboxUrl } from "@/utils/relayActivity";

const logger = createLogger("FollowButton");

type SessionUser = NonNullable<Session["user"]>;

const follow = async (user: SessionUser, followeeId: string) => {
  const follow = await prisma.follow.create({
    data: {
      followeeId: followeeId,
      followerId: user.id,
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
      userId: user.id,
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

const unfollow = async (user: SessionUser, followeeId: string) => {
  const follow = await prisma.follow.delete({
    where: {
      followeeId_followerId: {
        followeeId: followeeId,
        followerId: user.id,
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
      userId: user.id,
      inboxUrl: new URL(follow.followee.inboxUrl),
      activity: activityStreams.undo(
        activityStreams.follow(follow, follow.followee.actorUrl),
      ),
    });
  }
};

export async function action({ followeeId }: { followeeId: string }) {
  const session = await getServerSession();
  if (!session?.user) {
    // TODO: エラーを返す方法が実装されたら修正
    return;
  }
  const existingFollow = await prisma.follow.findFirst({
    where: {
      followeeId: followeeId,
      followerId: session.user.id,
    },
  });
  if (existingFollow) {
    await unfollow(session.user, followeeId);
  } else {
    await follow(session.user, followeeId);
  }
  revalidatePath(`/users/${followeeId}`);
}
