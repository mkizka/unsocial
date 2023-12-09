import type { User } from "@prisma/client";

import { userRepository } from "@/server/repository";
import type { PersonActivity } from "@/server/schema/person";
import { inboxPersonSchema } from "@/server/schema/person";
import { webFingerSchema } from "@/server/schema/webFinger";
import { activitypubService } from "@/server/service/activitypub";
import { env } from "@/utils/env";
import { formatZodError } from "@/utils/formatZodError";
import { getIconHash } from "@/utils/icon";
import { createLogger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";

import type { UserServiceError } from "./errors";
import {
  ActorValidationError,
  UserNotFoundError,
  WebfingerValidationError,
} from "./errors";

const logger = createLogger("findOrFetchUser");

// この関数のみテスト用にexport
export const shouldRefetch = (user: User) => {
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
  user: activitypubService.FetchWebFingerParams,
): Promise<string | Error> => {
  const response = await activitypubService.fetchWebFinger(user);
  if (response instanceof Error) {
    logger.info("Webfingerの取得に失敗しました");
    return response;
  }
  const parsed = webFingerSchema.safeParse(response);
  if (!parsed.success) {
    logger.info("検証失敗: " + formatZodError(parsed.error));
    return new WebfingerValidationError();
  }
  // webFingerSchemaで要素が一つ以上あることが保証されているので型エラーを無視する
  return parsed.data.links[0]!.href;
};

const fetchPersonByActorUrl = async (
  actorUrl: string,
): Promise<PersonActivity | Error> => {
  const response = await activitypubService.fetchActor(actorUrl);
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

const createOrUpdateUser = (
  person: PersonActivity,
  userIdForUpdate?: string,
) => {
  const data = {
    name: person.name,
    preferredUsername: person.preferredUsername,
    host: new URL(person.id).host,
    icon: person.icon?.url ?? null,
    iconHash: person.icon?.url ? getIconHash(person.icon.url) : null,
    actorUrl: person.id,
    inboxUrl: person.endpoints?.sharedInbox ?? person.inbox,
    publicKey: person.publicKey.publicKeyPem,
    lastFetchedAt: new Date(),
  };
  return userIdForUpdate
    ? prisma.user.update({ where: { id: userIdForUpdate }, data })
    : prisma.user.create({ data });
};

export const findOrFetchUserById = async (
  id: string,
): Promise<User | UserServiceError> => {
  const existingUser = await userRepository.findUnique({ id });
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

const getLocalUserId = (actorUrl: string) => {
  const url = new URL(actorUrl);
  // https://myhost.example.com/users/[userId]/activity
  const [_, prefixPath, userId, lastPath] = url.pathname.split("/");
  if (
    url.host === env.HOST &&
    prefixPath === "users" &&
    lastPath === "activity"
  ) {
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

export const findOrFetchUserByWebFinger = async (
  user: activitypubService.FetchWebFingerParams,
): Promise<User | UserServiceError> => {
  const existingUser = await userRepository.findUnique(user);
  // 自ホストのユーザーは自サーバーのWebFingerを自分で叩くことになるため、
  // 通信せずにエラーを返す
  if (!existingUser && user.host === env.HOST) {
    return new UserNotFoundError();
  }
  if (!existingUser || shouldRefetch(existingUser)) {
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
    return createOrUpdateUser(person, existingUser?.id);
  }
  return existingUser;
};
