import type { User } from "@prisma/client";
import { cache } from "react";

import { env } from "@/utils/env";
import { FetchError } from "@/utils/fetchJson";
import { formatZodError } from "@/utils/formatZodError";
import { createLogger } from "@/utils/logger";
import { safeUrl } from "@/utils/safeUrl";

import { apRepository, userRepository } from "../repository";
import { inboxPersonSchema } from "../schema/person";
import { webFingerSchema } from "../schema/webFinger";

const logger = createLogger("userService");

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

const fetchValidPerson = async (actorId: URL) => {
  const response = await apRepository.fetchActor(actorId);
  if (response instanceof FetchError) {
    return null;
  }
  const parsed = inboxPersonSchema.safeParse(response);
  if (!parsed.success) {
    logger.info("検証失敗: " + formatZodError(parsed.error));
    return null;
  }
  return parsed.data;
};

const fetchUserByActorId = async ({
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

export const findOrFetchUserByActorId = cache(async (actorId: URL) => {
  const existingUser = await userRepository.findByActorId(actorId);
  if (existingUser) {
    if (shouldReFetch(existingUser)) {
      return fetchUserByActorId({ actorId, userIdForUpdate: existingUser.id });
    }
    return existingUser;
  }
  return fetchUserByActorId({ actorId });
});

const resolveWebFingerResponse = (data: unknown) => {
  const parsed = webFingerSchema.safeParse(data);
  if (!parsed.success) {
    logger.info("検証失敗: " + formatZodError(parsed.error));
    return null;
  }
  const link = parsed.data.links.find((link) => link.rel == "self");
  if (!link) {
    logger.info("WebFingerからrel=selfの要素が取得できませんでした");
    return null;
  }
  return safeUrl(link.href!);
};

const fetchActorIdByWebFinger = async (params: {
  preferredUsername: string;
  host: string;
}) => {
  const response = await apRepository.fetchWebFinger(params);
  if (response instanceof FetchError) {
    return null;
  }
  return resolveWebFingerResponse(response);
};

const fetchUserByWebfinger = async (params: {
  preferredUsername: string;
  host: string;
  userIdForUpdate?: string;
}) => {
  const actorId = await fetchActorIdByWebFinger(params);
  if (!actorId) {
    return null;
  }
  return fetchUserByActorId({
    actorId,
    userIdForUpdate: params.userIdForUpdate,
  });
};

const findOrFetchUserByWebfinger = async (
  where: userRepository.FindFirstParams,
) => {
  const existingUser = await userRepository.findFirst(where);
  if (existingUser) {
    if (shouldReFetch(existingUser)) {
      return fetchUserByWebfinger({
        preferredUsername: existingUser.preferredUsername,
        host: existingUser.host,
        userIdForUpdate: existingUser.id,
      });
    }
    return existingUser;
  }
  if ("id" in where) {
    return null;
  }
  return fetchUserByWebfinger(where);
};

export const findOrFetchUserByParams = cache(
  async (params: { userId: string }) => {
    const userId = decodeURIComponent(params.userId);
    if (userId.startsWith("@")) {
      const [preferredUsername, host] = userId.split("@").slice(1);
      if (!preferredUsername) {
        return null;
      }
      return findOrFetchUserByWebfinger({
        preferredUsername,
        host: host ?? env.HOST,
      });
    }
    return findOrFetchUserByWebfinger({ id: userId });
  },
);

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
  return userRepository.findFirstWithCredentials({ id: userId });
};
