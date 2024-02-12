import assert from "assert";
import { cache } from "react";

import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import type { httpSignatureSignService } from "@/_shared/activitypub/httpSignatureSignService";
import { env } from "@/_shared/utils/env";
import { fetcher } from "@/_shared/utils/fetcher";
import { prisma } from "@/_shared/utils/prisma";

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

const getCC = (activity: apSchemaService.Activity) => {
  const targets: string[] = [];
  if ("cc" in activity && Array.isArray(activity.cc)) {
    targets.push(...activity.cc);
  }
  if (activity.type === "Undo") {
    if ("cc" in activity.object) {
      targets.push(...activity.object.cc);
    }
  }
  return unique(targets);
};

export const relay = async ({
  userId,
  activity,
  inboxUrl,
}: {
  userId: string;
  activity: apSchemaService.Activity;
  inboxUrl?: string | null;
}) => {
  const expandedTargets: string[] = inboxUrl ? [inboxUrl] : [];
  const targets = getCC(activity);
  for (const target of targets) {
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
