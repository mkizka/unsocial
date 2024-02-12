"use server";
import assert from "assert";
import { revalidatePath } from "next/cache";

import { apRelayService } from "@/_shared/activitypub/apRelayService";
import { userSessionService } from "@/_shared/user/services/userSessionService";
import { activityStreams } from "@/_shared/utils/activitypub";
import { prisma } from "@/_shared/utils/prisma";

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
  if (follow.followee.inboxUrl) {
    assert(follow.followee.actorUrl, "フォロー先のURLがありません");
    await apRelayService.relay({
      userId,
      activity: activityStreams.follow(follow, follow.followee.actorUrl),
      inboxUrl: follow.followee.inboxUrl,
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
  if (follow.followee.inboxUrl) {
    assert(follow.followee.actorUrl, "フォロー先のURLがありません");
    await apRelayService.relay({
      userId,
      activity: activityStreams.undo(
        activityStreams.follow(follow, follow.followee.actorUrl),
      ),
      inboxUrl: follow.followee.inboxUrl,
    });
  }
};

export async function action({ followeeId }: { followeeId: string }) {
  const userId = await userSessionService.getUserId({ redirect: true });
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
