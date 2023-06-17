import { prisma } from "@/utils/prisma";

import { fetchUserByActorId, shouldReFetch } from "./shared";

export const findOrFetchUserByActorId = async (actorId: URL) => {
  const existingUser = await prisma.user.findFirst({
    where: { actorUrl: actorId.toString() },
  });
  if (existingUser) {
    if (shouldReFetch(existingUser)) {
      return fetchUserByActorId({ actorId, userIdForUpdate: existingUser.id });
    }
    return existingUser;
  }
  return fetchUserByActorId({ actorId });
};
