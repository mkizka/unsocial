import type { User } from "@prisma/client";

import { apRepository, userRepository } from "@/server/repository";
import type { FindUniqueParams } from "@/server/repository/user";
import { inboxPersonSchema } from "@/server/schema/person";
import { webFingerSchema } from "@/server/schema/webFinger";
import { env } from "@/utils/env";
import { FetchError } from "@/utils/fetchJson";
import { formatZodError } from "@/utils/formatZodError";
import { createLogger } from "@/utils/logger";

import type { FindOrFetchUserError } from "./errorts";
import {
  ActorFailError,
  UserNotFoundError,
  WebfingerFailError,
} from "./errorts";

const logger = createLogger("findOrFetchUser");

const shouldReFetch = (user: User) => {
  if (user.host === env.HOST) {
    return false;
  }
  if (!user.lastFetchedAt) {
    return true;
  }
  const diff = Date.now() - user.lastFetchedAt.getTime();
  return diff >= 1000 * 60 * 60 * 3;
};

const fetchActorUrlByWebFinger = async (
  user: apRepository.FetchWebFingerParams,
) => {
  const response = await apRepository.fetchWebFinger(user);
  if (response instanceof FetchError) {
    return null;
  }
  const parsed = webFingerSchema.safeParse(response);
  if (!parsed.success) {
    // TODO: テスト追加
    logger.info("検証失敗: " + formatZodError(parsed.error));
    return null;
  }
  const link = parsed.data.links.find((link) => link.rel === "self");
  // TODO: テスト追加
  return link!.href!;
};

const fetchPersonByActorUrl = async (actorUrl: string) => {
  const response = await apRepository.fetchActor(actorUrl);
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

const findOrFetchUserById = async (
  id: string,
): Promise<User | FindOrFetchUserError> => {
  const existingUser = await userRepository.findUnique({ id });
  if (!existingUser) {
    // id指定で見つからなかった場合はこれ以上できることないのでエラーを返す
    return new UserNotFoundError();
  }
  if (shouldReFetch(existingUser)) {
    const actorUrl = await fetchActorUrlByWebFinger(existingUser);
    if (!actorUrl) {
      return existingUser;
    }
    const person = await fetchPersonByActorUrl(actorUrl);
    if (!person) {
      return existingUser;
    }
    return userRepository.createOrUpdateUser(person, existingUser.id);
  }
  return existingUser;
};

const findOrFetchUserByActor = async (
  actorUrl: string,
): Promise<User | FindOrFetchUserError> => {
  const existingUser = await userRepository.findUnique({ actorUrl });
  if (!existingUser || shouldReFetch(existingUser)) {
    const person = await fetchPersonByActorUrl(actorUrl);
    if (!person) {
      return existingUser || new ActorFailError();
    }
    // DBにあったら更新、なかったら作成
    return userRepository.createOrUpdateUser(person, existingUser?.id);
  }
  return existingUser;
};

const findOrFetchUserByWebFinger = async (
  user: apRepository.FetchWebFingerParams,
): Promise<User | FindOrFetchUserError> => {
  const existingUser = await userRepository.findUnique(user);
  if (!existingUser || shouldReFetch(existingUser)) {
    const actorUrl = await fetchActorUrlByWebFinger(user);
    if (!actorUrl) {
      return existingUser || new WebfingerFailError();
    }
    const person = await fetchPersonByActorUrl(actorUrl);
    if (!person) {
      return existingUser || new ActorFailError();
    }
    // DBにあったら更新、なかったら作成
    return userRepository.createOrUpdateUser(person, existingUser?.id);
  }
  return existingUser;
};

export const findOrFetchUser = async (params: FindUniqueParams) => {
  if ("id" in params) {
    return findOrFetchUserById(params.id);
  }
  if ("actorUrl" in params) {
    return findOrFetchUserByActor(params.actorUrl);
  }
  return findOrFetchUserByWebFinger(params);
};
