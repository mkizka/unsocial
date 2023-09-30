import { credentialService } from "@/server/service";

import { fetchJson } from "./fetchJson";
import type { SignActivityParams } from "./httpSignature/sign";
import { signHeaders } from "./httpSignature/sign";
import { prisma } from "./prisma";

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
  const signedHeaders = signHeaders(params);
  await fetchJson(params.inboxUrl, {
    method: "POST",
    body: params.body,
    headers: {
      Accept: "application/activity+json",
      ...signedHeaders,
    },
  });
};

type RelayActivityParams = {
  userId: string;
  activity: object;
  inboxUrl: URL;
};

export const relayActivityToInboxUrl = async (params: RelayActivityParams) => {
  const privateKey = await credentialService.findUnique(params.userId);
  if (!privateKey) {
    throw new Error(`配送に必要な秘密鍵がありませんでした: ${params.userId}`);
  }
  await relayActivity({
    signer: {
      id: params.userId,
      privateKey,
    },
    body: JSON.stringify(params.activity),
    inboxUrl: params.inboxUrl,
  });
};

export const relayActivityToFollowers = async (
  params: Omit<RelayActivityParams, "inboxUrl">,
) => {
  const privateKey = await credentialService.findUnique(params.userId);
  if (!privateKey) {
    throw new Error(`配送に必要な秘密鍵がありませんでした: ${params.userId}`);
  }
  const inboxUrls = await getUniqueInboxUrls(params.userId);
  const promises = inboxUrls.map((inboxUrl) =>
    relayActivity({
      signer: {
        id: params.userId,
        privateKey,
      },
      body: JSON.stringify(params.activity),
      inboxUrl,
    }),
  );
  await Promise.all(promises);
};
