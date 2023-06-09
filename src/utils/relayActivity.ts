import type { AP } from "activitypub-core-types";
import got from "got";
import type { Session } from "next-auth";

import { signActivity } from "@/utils/httpSignature/sign";
import { logger } from "@/utils/logger";

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
  const response = await got(params.inboxUrl, {
    method: "POST",
    json: params.activity,
    headers: {
      Accept: "application/activity+json",
      ...signedHeaders,
    },
  });
  logger.info(`${params.inboxUrl}: ${response.body}`);
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

export const relayActivity = async (params: {
  sender: NonNullable<Session["user"]>;
  activity: AP.Activity;
}) => {
  // TODO: 連合先の各サーバーに送信するようにする
  const inboxUrl = new URL("https://misskey.localhost/inbox");
  const signedHeaders = signActivity({ ...params, inboxUrl });
  logger.info(`Activity送信: ${JSON.stringify(params.activity)}`);
  const response = await got(inboxUrl, {
    method: "POST",
    json: params.activity,
    headers: {
      Accept: "application/activity+json",
      ...signedHeaders,
    },
  });
  logger.info(`${inboxUrl}: ${response.body}`);
};
