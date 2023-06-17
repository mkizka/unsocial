import { prisma } from "@/utils/prisma";

import { logger } from "./logger";

const resolveUserId = (actorId: URL) => {
  if (!actorId.pathname.startsWith("/users/")) {
    logger.info("actorIdからuserIdが取得できませんでした");
    return null;
  }
  return actorId.pathname.split("/")[2];
};

export const findUserByActorId = async (actorId: URL) => {
  const userId = resolveUserId(actorId);
  if (!userId) {
    return null;
  }
  return prisma.user.findFirst({
    where: { id: userId },
  });
};
