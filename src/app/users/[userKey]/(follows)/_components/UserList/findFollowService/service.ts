import { cache } from "react";

import { prisma } from "@/app/_shared/utils/prisma";

export const followers = cache(async (userId: string) => {
  const follows = await prisma.follow.findMany({
    where: {
      followeeId: userId,
    },
    include: {
      follower: true,
    },
  });
  return follows.map((follow) => follow.follower);
});

export const followees = cache(async (userId: string) => {
  const follows = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    include: {
      followee: true,
    },
  });
  return follows.map((follow) => follow.followee);
});
