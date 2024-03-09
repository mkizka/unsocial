import type { User } from "@prisma/client";

import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";

import { userFindRepository } from "./userFindRepository";
import { findOrFetchUserById } from "./userId";
import { shouldRefetch } from "./utils";

const logger = createLogger("userFindService.findOrFetchUserByActor");

const getLocalUserId = (actorUrl: string) => {
  const url = new URL(actorUrl);
  // https://myhost.example.com/users/[userId]/activity
  const [_, prefixPath, userId, lastPath] = url.pathname.split("/");
  if (url.host === env.UNSOCIAL_HOST) {
    if (prefixPath === "users" && lastPath === "activity") {
      return userId;
    } else {
      return new Error();
    }
  }
  return null;
};

export const findOrFetchUserByActor = async (
  actorUrl: string,
): Promise<User | Error> => {
  // 自ホストのユーザーはactorUrlがnullになっているため、
  // idをURLから取り出してDBから取得する
  const localUserId = getLocalUserId(actorUrl);
  if (localUserId instanceof Error) {
    logger.warn("actorUrlの形式が不正です", { actorUrl });
    return localUserId;
  }
  if (localUserId) {
    return findOrFetchUserById(localUserId);
  }
  const existingUser = await prisma.user.findUnique({ where: { actorUrl } });
  if (!existingUser || shouldRefetch(existingUser)) {
    const person = await userFindRepository.fetchPersonByActorUrl(actorUrl);
    if (person instanceof Error) {
      logger.warn("リモートユーザーの更新に失敗しました", {
        actorUrl,
        error: person,
      });
      return existingUser || person;
    }
    return userFindRepository.createOrUpdateUser(person, existingUser?.id);
  }
  return existingUser;
};
