import assert from "assert";
import { cache } from "react";

import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import type { httpSignatureSignService } from "@/_shared/activitypub/httpSignatureSignService";
import { env } from "@/_shared/utils/env";
import { fetcher } from "@/_shared/utils/fetcher";
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

const relayActivity = async (
  params: Omit<httpSignatureSignService.SignActivityParams, "method">,
) => {
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

const expandActorUrls = async (url: string) => {
  const urlObject = new URL(url);
  // ひとまず https://${env.UNSOCIAL_HOST}/users/${note.userId}/followers のみ処理する
  if (urlObject.host === env.UNSOCIAL_HOST) {
    const [_, path1, userId, path2] = urlObject.pathname.split("/");
    if (path1 === "users" && path2 === "followers") {
      const follows = await prisma.follow.findMany({
        where: { followeeId: userId },
        include: { follower: true },
      });
      return follows.map((follow) => follow.follower.inboxUrl).filter(Boolean);
    }
    throw new Error(
      `配送先として/folowers以外の自サーバーのURLは指定できません ${url}`,
    );
  }
  const remoteUser = await prisma.user.findUnique({ where: { actorUrl: url } });
  assert(remoteUser, `指定されたactorのユーザーが見つかりませんでした: ${url}`);
  assert(
    remoteUser.inboxUrl,
    `指定されたactorのinboxUrlが見つかりませんでした: ${url}`,
  );
  return [remoteUser.inboxUrl];
};

const unique = <T>(array: T[]) => [...new Set(array)];

export const relay = async ({
  userId,
  activity,
}: {
  userId: string;
  activity: apSchemaService.Activity;
}) => {
  const expandedTargets: string[] = [];
  const targets = [
    "to" in activity ? activity.to : null,
    "cc" in activity ? activity.cc : null,
  ]
    .filter(Boolean)
    .flat();
  // toまたはccに送信先の指定が無ければフォロワーに配送する
  if (targets.length === 0) {
    targets.push(`https://${env.UNSOCIAL_HOST}/users/${userId}/followers`);
  }
  for (const target of targets) {
    if (target === "https://www.w3.org/ns/activitystreams#Public") {
      continue;
    }
    // N+1ではあるがtargetsの数は基本的に少ないので一旦許容
    const urls = await expandActorUrls(target);
    expandedTargets.push(...urls);
  }
  const privateKey = await findPrivateKey(userId);
  assert(privateKey, `配送に必要な秘密鍵がありませんでした: ${userId}`);
  return Promise.all(
    unique(expandedTargets).map((target) =>
      relayActivity({
        signer: {
          id: userId,
          privateKey,
        },
        body: JSON.stringify(activity),
        inboxUrl: new URL(target),
      }),
    ),
  );
};
