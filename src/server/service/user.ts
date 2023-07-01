import type { User } from "@prisma/client";

import { env } from "@/utils/env";
import { formatZodError } from "@/utils/formatZodError";
import { createLogger } from "@/utils/logger";

import { apRepository, userRepository } from "../repository";
import { personSchema } from "../schema";

const shouldReFetch = (user: User) => {
  if (user.host == env.HOST) {
    return false;
  }
  if (!user.lastFetchedAt) {
    return true;
  }
  const diff = Date.now() - user.lastFetchedAt.getTime();
  return diff >= 1000 * 60 * 60 * 3;
};

const logger = createLogger("userService");

const fetchValidPerson = async (actorId: URL) => {
  const response = await apRepository.fetchActor(actorId);
  const parsed = personSchema.safeParse(response);
  if (!parsed.success) {
    logger.info("検証失敗: " + formatZodError(parsed.error));
    return null;
  }
  return parsed.data;
};

export const fetchUserByActorId = async ({
  actorId,
  userIdForUpdate,
}: {
  actorId: URL;
  userIdForUpdate?: string;
}) => {
  const person = await fetchValidPerson(actorId);
  if (!person) {
    return null;
  }
  return userRepository.createOrUpdateUser(person, userIdForUpdate);
};

export const findOrFetchUserByActorId = async (actorId: URL) => {
  const existingUser = await userRepository.findByActorId(actorId);
  if (existingUser) {
    if (shouldReFetch(existingUser)) {
      return fetchUserByActorId({ actorId, userIdForUpdate: existingUser.id });
    }
    return existingUser;
  }
  return fetchUserByActorId({ actorId });
};
