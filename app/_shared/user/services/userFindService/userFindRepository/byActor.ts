import type { User } from "@prisma/client";

import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

import { findOrFetchUserById } from "./byId";
import {
  createOrUpdateUser,
  fetchPersonByActorUrl,
  shouldRefetch,
} from "./shared";

const getLocalUserId = (actorUrl: string) => {
  const url = new URL(actorUrl);
  // https://myhost.example.com/users/[userId]/activity
  const [_, prefixPath, userId, lastPath] = url.pathname.split("/");
  if (
    url.host === env.UNSOCIAL_HOST &&
    prefixPath === "users" &&
    lastPath === "activity"
  ) {
    return userId;
  }
  return null;
};

export const findOrFetchUserByActor = async (
  actorUrl: string,
): Promise<User | Error> => {
  // 自ホストのユーザーはactorUrlがnullになっているため、
  // idをURLから取り出してDBから取得する
  const localUserId = getLocalUserId(actorUrl);
  if (localUserId) {
    return findOrFetchUserById(localUserId);
  }
  const existingUser = await prisma.user.findUnique({ where: { actorUrl } });
  if (!existingUser || shouldRefetch(existingUser)) {
    const person = await fetchPersonByActorUrl(actorUrl);
    if (person instanceof Error) {
      return existingUser || person;
    }
    // DBにあったら更新、なかったら作成
    return createOrUpdateUser(person, existingUser?.id);
  }
  return existingUser;
};
