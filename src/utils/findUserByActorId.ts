import { prisma } from "@/server/prisma";

const resolveUserId = (actorId: URL) => {
  if (!actorId.pathname.startsWith("/users/")) {
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
