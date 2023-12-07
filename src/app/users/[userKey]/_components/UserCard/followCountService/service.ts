import { cache } from "react";

import { prisma } from "@/utils/prisma";

const countFollowers = (userId: string) => {
  return prisma.follow.count({
    where: {
      followeeId: userId,
    },
  });
};

const countFollowees = (userId: string) => {
  return prisma.follow.count({
    where: {
      followerId: userId,
    },
  });
};

export const count = cache(async (userId: string) => {
  return {
    followersCount: await countFollowers(userId),
    followeesCount: await countFollowees(userId),
  };
});
