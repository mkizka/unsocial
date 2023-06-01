import { queue } from "@/server/background/queue";
import { prisma } from "@soshal/database";
import { activityStreams } from "@/utils/activitypub";
import { env } from "@/utils/env";
import { getServerSession } from "@/utils/getServerSession";

type User = {
  id: string;
  privateKey: string;
};

const follow = async (user: User, followeeId: string) => {
  const follow = await prisma.follow.create({
    data: {
      followeeId: followeeId,
      followerId: user.id,
      status: "SENT",
    },
    include: {
      followee: {
        select: {
          host: true,
          actorUrl: true,
        },
      },
    },
  });
  if (follow.followee.host != env.HOST) {
    if (!follow.followee.actorUrl) {
      throw new Error("フォロー先のURLがありません");
    }
    queue.push({
      runner: "relayActivity",
      params: {
        sender: user,
        activity: activityStreams.follow(follow, follow.followee.actorUrl),
      },
    });
  } else {
    await prisma.follow.update({
      where: { id: follow.id },
      data: { status: "ACCEPTED" },
    });
  }
};

const unfollow = async (user: User, followeeId: string) => {
  const follow = await prisma.follow.delete({
    where: {
      followeeId_followerId: {
        followeeId: followeeId,
        followerId: user.id,
      },
    },
    include: {
      followee: {
        select: {
          host: true,
          actorUrl: true,
        },
      },
    },
  });
  if (follow.followee.host != env.HOST) {
    if (!follow.followee.actorUrl) {
      throw new Error("フォロー先のURLがありません");
    }
    queue.push({
      runner: "relayActivity",
      params: {
        sender: user,
        activity: activityStreams.undo(
          activityStreams.follow(follow, follow.followee.actorUrl)
        ),
      },
    });
  }
};

export async function action({ followeeId }: { followeeId: string }) {
  const session = await getServerSession();
  if (!session?.user) {
    // TODO: エラーを返す方法が実装されたら修正
    return { error: "ログインが必要です" };
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
}
