import type { User } from "@prisma/client";
import assert from "assert";

import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";

import { UserNotFoundError } from "./errors";
import { userFindRepository } from "./userFindRepository";
import { shouldRefetch } from "./utils";

const logger = createLogger("userFindService.findOrFetchUserById");

export const findOrFetchUserById = async (
  id: string,
): Promise<User | Error> => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    // id指定で見つからなかった場合はこれ以上できることないのでエラーを返す
    return new UserNotFoundError();
  }
  if (shouldRefetch(existingUser)) {
    assert(existingUser.actorUrl);
    const person = await userFindRepository.fetchPersonByActorUrl(
      existingUser.actorUrl,
    );
    if (person instanceof Error) {
      logger.info("リモートユーザーの更新に失敗しました: " + person.name);
      return existingUser;
    }
    return userFindRepository.createOrUpdateUser(person, existingUser.id);
  }
  return existingUser;
};
