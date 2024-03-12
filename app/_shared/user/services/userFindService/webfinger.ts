import type { User } from "@prisma/client";
import { fromZodError } from "zod-validation-error";

import { apFetchService } from "@/_shared/activitypub/apFetchService";
import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";

import { UserNotFoundError } from "./errors";
import { userFindRepository } from "./userFindRepository";
import { shouldRefetch } from "./utils";

const logger = createLogger("userFindService.findOrFetchUserByWebFinger");

const fetchActorUrlByWebFinger = async (
  user: apFetchService.FetchWebFingerParams,
): Promise<string | Error> => {
  const response = await apFetchService.fetchWebFinger(user);
  if (response instanceof Error) {
    return response;
  }
  const parsed = apSchemaService.webFingerSchema.safeParse(response);
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }
  // webFingerSchemaで要素が一つ以上あることが保証されているので型エラーを無視する
  return parsed.data.links[0]!.href;
};

// 引数がプリミティブでないのでReact.cacheは使わない(findOrFetchUserByKey側でcacheする)
// https://ja.react.dev/reference/react/cache#memoized-function-still-runs
export const findOrFetchUserByWebFinger = async (
  user: apFetchService.FetchWebFingerParams,
): Promise<User | Error> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      preferredUsername_host: {
        preferredUsername: user.preferredUsername,
        host: user.host,
      },
    },
  });
  // 自ホストのユーザーは自サーバーのWebFingerを自分で叩くことになるため、
  // 通信せずにエラーを返す
  if (!existingUser && user.host === env.UNSOCIAL_HOST) {
    return new UserNotFoundError();
  }
  if (!existingUser || shouldRefetch(existingUser)) {
    // actorUrlが分からないのでWebFingerで取得
    const actorUrl = await fetchActorUrlByWebFinger(user);
    if (actorUrl instanceof Error) {
      logger.warn("WebfingerからActorURLの取得に失敗しました", {
        user,
        error: actorUrl,
      });
      return existingUser || actorUrl;
    }
    const person = await userFindRepository.fetchPersonByActorUrl(actorUrl);
    if (person instanceof Error) {
      logger.warn("Actorの取得に失敗しました", {
        actorUrl,
        error: person,
      });
      return existingUser || person;
    }
    return userFindRepository.upsertUser(person);
  }
  return existingUser;
};
