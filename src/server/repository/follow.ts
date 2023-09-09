import { prisma } from "@/utils/prisma";

export const findFollowers = async (userId: string) => {
  const follows = await prisma.follow.findMany({
    where: {
      followeeId: userId,
    },
    include: {
      follower: true,
    },
  });
  return follows.map((follow) => follow.follower);
};

export const findFollowees = async (userId: string) => {
  const follows = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    include: {
      followee: true,
    },
  });
  return follows.map((follow) => follow.followee);
};

export const countFollowers = (userId: string) => {
  return prisma.follow.count({
    where: {
      followeeId: userId,
    },
  });
};

export const countFollowees = (userId: string) => {
  return prisma.follow.count({
    where: {
      followerId: userId,
    },
  });
};

type UniqueParams = {
  followeeId: string;
  followerId: string;
};

export const createAndAccept = (params: UniqueParams) => {
  return prisma.follow.create({
    data: {
      ...params,
      status: "ACCEPTED",
    },
  });
};

export const accept = (params: UniqueParams) => {
  return prisma.follow.update({
    where: {
      followeeId_followerId: params,
    },
    data: {
      status: "ACCEPTED",
    },
  });
};

export const remove = (options: UniqueParams) => {
  return prisma.follow.delete({
    where: {
      followeeId_followerId: options,
    },
  });
};
