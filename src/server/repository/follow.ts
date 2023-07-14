import { prisma } from "@/utils/prisma";

type Options = {
  followeeId: string;
  followerId: string;
};

export const createAndAccept = (options: Options) => {
  return prisma.follow.create({
    data: {
      ...options,
      status: "ACCEPTED",
    },
  });
};
