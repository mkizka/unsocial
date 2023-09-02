import { credentialService } from "@/server/service";
import type { SignActivityParams } from "@/utils/httpSignature/sign";
import { signActivity } from "@/utils/httpSignature/sign";

import { fetchJson } from "./fetchJson";
import { createLogger } from "./logger";
import { prisma } from "./prisma";

const logger = createLogger("relayActivity");

const isNotNull = <T>(value: T): value is NonNullable<T> => value !== null;

const getUniqueInboxUrls = async (userId: string) => {
  const followerInboxes = await prisma.follow
    .findMany({
      where: { followeeId: userId },
      include: { follower: true },
    })
    .then((follows) =>
      follows.map((follow) => follow.follower.inboxUrl).filter(isNotNull),
    );
  return [...new Set(followerInboxes)].map((inboxUrl) => new URL(inboxUrl));
};

const relayActivity = async (params: SignActivityParams) => {
  const signedHeaders = signActivity(params);
  logger.info(`Activity送信: ${JSON.stringify(params.activity)}`);
  const response = await fetchJson(params.inboxUrl, {
    method: "POST",
    body: JSON.stringify(params.activity),
    headers: {
      Accept: "application/activity+json",
      ...signedHeaders,
    },
  });
  logger.info(`${params.inboxUrl}: ${response}`);
};

export const relayActivityToInboxUrl = async (
  params: Omit<SignActivityParams, "privateKey">,
) => {
  const privateKey = await credentialService.findUnique(params.userId);
  if (!privateKey) {
    throw new Error(`配送に必要な秘密鍵がありませんでした: ${params.userId}`);
  }
  await relayActivity({ ...params, privateKey });
};

export const relayActivityToFollowers = async (
  params: Omit<SignActivityParams, "privateKey" | "inboxUrl">,
) => {
  const privateKey = await credentialService.findUnique(params.userId);
  if (!privateKey) {
    throw new Error(`配送に必要な秘密鍵がありませんでした: ${params.userId}`);
  }
  const inboxUrls = await getUniqueInboxUrls(params.userId);
  const promises = inboxUrls.map((inboxUrl) =>
    relayActivity({ ...params, privateKey, inboxUrl }),
  );
  await Promise.all(promises);
};
