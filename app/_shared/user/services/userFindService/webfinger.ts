import type { User } from "@prisma/client";
import { fromZodError } from "zod-validation-error";

import { apFetchService } from "@/_shared/activitypub/apFetchService";
import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

import { UserNotFoundError, WebfingerValidationError } from "./errors";
import { userFindRepository } from "./userFindRepository";
import { logger, shouldRefetch } from "./utils";

const fetchActorUrlByWebFinger = async (
  user: apFetchService.FetchWebFingerParams,
): Promise<string | Error> => {
  const response = await apFetchService.fetchWebFinger(user);
  if (response instanceof Error) {
    logger.info("Webfingerの取得に失敗しました");
    return response;
  }
  const parsed = apSchemaService.webFingerSchema.safeParse(response);
  if (!parsed.success) {
    logger.info(
      "WebFingerの検証に失敗しました: " + fromZodError(parsed.error).toString(),
    );
    return new WebfingerValidationError();
  }
  // webFingerSchemaで要素が一つ以上あることが保証されているので型エラーを無視する
  return parsed.data.links[0]!.href;
};

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
      return existingUser || actorUrl;
    }
    const person = await userFindRepository.fetchPersonByActorUrl(actorUrl);
    if (person instanceof Error) {
      return existingUser || person;
    }
    // DBにあったら更新、なかったら作成
    return userFindRepository.createOrUpdateUser(person, existingUser?.id);
  }
  return existingUser;
};