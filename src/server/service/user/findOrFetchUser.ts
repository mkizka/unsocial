import type { User } from "@prisma/client";

import { apRepository, userRepository } from "@/server/repository";
import type { PersonActivity } from "@/server/schema/person";
import { inboxPersonSchema } from "@/server/schema/person";
import { webFingerSchema } from "@/server/schema/webFinger";
import { env } from "@/utils/env";
import { FetchError } from "@/utils/fetchJson";
import { formatZodError } from "@/utils/formatZodError";
import { createLogger } from "@/utils/logger";

import type { UserServiceError } from "./errors";
import {
  ActorValidationError,
  UserNotFoundError,
  WebfingerValidationError,
} from "./errors";

const logger = createLogger("findOrFetchUser");

// この関数のみテスト用にexport
export const shouldReFetch = (user: User) => {
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
): Promise<string | FetchError | UserServiceError> => {
  const response = await apRepository.fetchWebFinger(user);
  if (response instanceof FetchError) {
    logger.info("Webfingerの取得に失敗しました");
    return response;
  }
  const parsed = webFingerSchema.safeParse(response);
  if (!parsed.success) {
    // TODO: テスト追加
    logger.info("検証失敗: " + formatZodError(parsed.error));
    return new WebfingerValidationError();
  }
  const link = parsed.data.links.find((link) => link.rel === "self");
  if (link?.href) {
    return link.href;
  }
  logger.info("actorUrlがWebFingerから見つかりませんでした");
  return new WebfingerValidationError();
};

const fetchPersonByActorUrl = async (
  actorUrl: string,
): Promise<PersonActivity | FetchError | UserServiceError> => {
  const response = await apRepository.fetchActor(actorUrl);
  if (response instanceof Error) {
    logger.info("Actorの取得に失敗しました");
    return response;
  }
  const parsed = inboxPersonSchema.safeParse(response);
  if (!parsed.success) {
    logger.info("検証失敗: " + formatZodError(parsed.error));
    return new ActorValidationError();
  }
  return parsed.data;
};

export const findOrFetchUserById = async (
  id: string,
): Promise<User | UserServiceError> => {
  const existingUser = await userRepository.findUnique({ id });
  if (!existingUser) {
    // id指定で見つからなかった場合はこれ以上できることないのでエラーを返す
    return new UserNotFoundError();
  }
  if (shouldReFetch(existingUser)) {
    // リモートユーザーならactorUrlを持っているはずなので型エラーを無視
    const person = await fetchPersonByActorUrl(existingUser.actorUrl!);
    if (person instanceof Error) {
      return existingUser;
    }
    return userRepository.createOrUpdateUser(person, existingUser.id);
  }
  return existingUser;
};

const getLocalUserId = (actorUrl: string) => {
  const url = new URL(actorUrl);
  if (url.host !== env.HOST) {
    return null;
  }
  // https://myhost.example.com/users/[userId]/activity
  const [_, prefixPath, userId, lastPath] = url.pathname.split("/");
  if (prefixPath === "users" && lastPath === "activity") {
    return userId;
  }
  return null;
};

export const findOrFetchUserByActor = async (
  actorUrl: string,
): Promise<User | UserServiceError> => {
  // 自ホストのユーザーはactorUrlがnullになっているため、
  // idをURLから取り出してDBから取得する
  const localUserId = getLocalUserId(actorUrl);
  if (localUserId) {
    return findOrFetchUserById(localUserId);
  }
  const existingUser = await userRepository.findUnique({ actorUrl });
  if (!existingUser || shouldReFetch(existingUser)) {
    const person = await fetchPersonByActorUrl(actorUrl);
    if (person instanceof Error) {
      return existingUser || person;
    }
    // DBにあったら更新、なかったら作成
    return userRepository.createOrUpdateUser(person, existingUser?.id);
  }
  return existingUser;
};

export const findOrFetchUserByWebFinger = async (
  user: apRepository.FetchWebFingerParams,
): Promise<User | UserServiceError> => {
  const existingUser = await userRepository.findUnique(user);
  if (!existingUser || shouldReFetch(existingUser)) {
    // actorUrlが分からないのでWebFingerで取得
    const actorUrl = await fetchActorUrlByWebFinger(user);
    if (actorUrl instanceof Error) {
      return existingUser || actorUrl;
    }
    const person = await fetchPersonByActorUrl(actorUrl);
    if (person instanceof Error) {
      return existingUser || person;
    }
    // DBにあったら更新、なかったら作成
    return userRepository.createOrUpdateUser(person, existingUser?.id);
  }
  return existingUser;
};
