import { defineFollowFactory } from "@/_generated";
import { prisma } from "@/_shared/utils/prisma";

import { LocalUserFactory, RemoteUserFactory } from "./user";

const factory = defineFollowFactory({
  defaultData: {
    follower: RemoteUserFactory,
    followee: LocalUserFactory,
  },
});

export const FollowFactory = {
  create: async (...args: Parameters<typeof factory.build>) => {
    const data = await factory.build(...args);
    return prisma.follow.create({
      data,
      include: {
        follower: true,
        followee: true,
      },
    });
  },
};
