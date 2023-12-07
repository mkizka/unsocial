import { prisma } from "@/utils/prisma";

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
