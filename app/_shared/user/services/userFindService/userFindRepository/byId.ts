import type { User } from "@prisma/client";

import { prisma } from "@/_shared/utils/prisma";

import { UserNotFoundError } from "./errors";
import {
  createOrUpdateUser,
  fetchPersonByActorUrl,
  shouldRefetch,
} from "./shared";

export const findOrFetchUserById = async (
  id: string,
): Promise<User | Error> => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    // id指定で見つからなかった場合はこれ以上できることないのでエラーを返す
    return new UserNotFoundError();
  }
  if (shouldRefetch(existingUser)) {
    // リモートユーザーならactorUrlを持っているはずなので型エラーを無視
    const person = await fetchPersonByActorUrl(existingUser.actorUrl!);
    if (person instanceof Error) {
      return existingUser;
    }
    return createOrUpdateUser(person, existingUser.id);
  }
  return existingUser;
};
