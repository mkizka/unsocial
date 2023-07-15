import { prisma } from "@/utils/prisma";

type CreateParams = {
  followeeId: string;
  followerId: string;
};

export const createAndAccept = (params: CreateParams) => {
  return prisma.follow.create({
    data: {
      ...params,
      status: "ACCEPTED",
    },
  });
};

type RemoveParams = {
  followeeId: string;
  followerId: string;
};

export const remove = (options: RemoveParams) => {
  return prisma.follow.delete({
    where: {
      followeeId_followerId: options,
    },
  });
};
