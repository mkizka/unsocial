import type { AP } from "activitypub-core-types";
import type { Session } from "next-auth";

import { signActivity } from "@/utils/httpSignature/sign";
import { logger } from "@/utils/logger";

import { fetchJson } from "./fetchJson";
import { prisma } from "./prisma";

const isNotNull = <T>(value: T): value is NonNullable<T> => value != null;

const getUniqueInboxUrls = async (userId: string) => {
  const followerInboxes = await prisma.follow
    .findMany({
      where: { followeeId: userId },
      include: { follower: true },
    })
    .then((follows) =>
      follows.map((follow) => follow.follower.inboxUrl).filter(isNotNull)
    );
  return [...new Set(followerInboxes)].map((inboxUrl) => new URL(inboxUrl));
};

export const relayActivityToInboxUrl = async (params: {
  sender: NonNullable<Session["user"]>;
  activity: AP.Activity;
  inboxUrl: URL;
}) => {
  const signedHeaders = signActivity(params);
  logger.info(`Activity送信: ${JSON.stringify(params.activity)}`);
  const response = await fetchJson(params.inboxUrl, {
    method: "POST",
    body: JSON.stringify(params.activity),
    headers: {
      "Content-Type": "application/activity+json",
      Accept: "application/activity+json",
      ...signedHeaders,
    },
  });
  logger.info(`${params.inboxUrl}: ${response}`);
};

export const relayActivityToFollowers = async (params: {
  sender: NonNullable<Session["user"]>;
  activity: AP.Activity;
}) => {
  const inboxUrls = await getUniqueInboxUrls(params.sender.id);
  const promises = inboxUrls.map((inboxUrl) =>
    relayActivityToInboxUrl({ ...params, inboxUrl })
  );
  await Promise.all(promises);
};
