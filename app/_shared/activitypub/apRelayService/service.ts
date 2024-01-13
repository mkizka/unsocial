import { cache } from "react";

import { fetcher } from "@/_shared/utils/fetcher";
import type { SignActivityParams } from "@/_shared/utils/httpSignature/sign";
import { prisma } from "@/_shared/utils/prisma";

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

const relayActivity = async (params: Omit<SignActivityParams, "method">) => {
  await fetcher(params.inboxUrl, {
    method: "POST",
    body: params.body,
    headers: {
      accept: "application/activity+json",
      "content-type": "application/activity+json",
    },
    signer: params.signer,
    timeout: 30000,
  });
};

const findPrivateKey = cache(async (userId: string) => {
  const credential = await prisma.credential.findUnique({
    where: {
      userId,
    },
  });
  return credential?.privateKey ?? null;
});

type RelayActivityParams = {
  userId: string;
  activity: object;
  inboxUrl: URL;
};

export const relayActivityToInboxUrl = async (params: RelayActivityParams) => {
  const privateKey = await findPrivateKey(params.userId);
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
  const privateKey = await findPrivateKey(params.userId);
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
