import { z } from "zod";

import { activityStreams } from "../../../utils/activitypub";
import { env } from "../../../utils/env";
import { queue } from "../../background/queue";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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

export const followRouter = createTRPCRouter({
  get: protectedProcedure.input(z.string()).query(({ input, ctx }) => {
    return prisma.follow.findFirst({
      where: {
        followeeId: input,
        followerId: ctx.session.user.id,
      },
    });
  }),
  create: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const existingFollow = await prisma.follow.findFirst({
        where: {
          followeeId: input,
          followerId: ctx.session.user.id,
        },
      });
      if (existingFollow) {
        await unfollow(ctx.session.user, input);
      } else {
        await follow(ctx.session.user, input);
      }
    }),
});
