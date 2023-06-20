import { z } from "zod";

import { prisma } from "@/utils/prisma";

import { env } from "../env";
import { fetchJson } from "../fetchJson";
import { formatZodError } from "../formatZodError";
import { createLogger } from "../logger";
import { fetchUserByActorId, shouldReFetch } from "./shared";

const logger = createLogger("findOrFetchUserByParams");

const webfingerSchema = z.object({
  links: z.array(
    z.object({
      rel: z.string(),
      href: z.string().url().optional(),
    })
  ),
});

const safeUrl = (url: string) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

const resolveWebFingerResponse = (data: unknown) => {
  const parsed = webfingerSchema.safeParse(data);
  if (!parsed.success) {
    logger.info("検証失敗: " + formatZodError(parsed.error));
    return null;
  }
  const link = parsed.data.links.find((link) => link.rel == "self");
  if (!link) {
    logger.info("WebFingerからrel=selfの要素が取得できませんでした");
    return null;
  }
  return safeUrl(link.href!);
};

const fetchActorIdByWebFinger = async (params: {
  preferredUsername: string;
  host: string;
}) => {
  const remoteUrl = safeUrl(`https://${params.host}`);
  if (!remoteUrl) {
    logger.info(`https://${params.host}がURLとして不正でした`);
    return null;
  }
  const webFingerUrl = new URL("/.well-known/webfinger", remoteUrl);
  webFingerUrl.searchParams.append(
    "resource",
    `acct:${params.preferredUsername}@${params.host}`
  );
  const response = await fetchJson(webFingerUrl, {
    next: {
      revalidate: 0,
    },
  });
  if (!response) {
    return null;
  }
  return resolveWebFingerResponse(response);
};

const fetchUserByWebfinger = async (params: {
  preferredUsername: string;
  host: string;
  userIdForUpdate?: string;
}) => {
  const actorId = await fetchActorIdByWebFinger(params);
  if (!actorId) {
    return null;
  }
  return fetchUserByActorId({
    actorId,
    userIdForUpdate: params.userIdForUpdate,
  });
};

type Where =
  | {
      preferredUsername: string;
      host: string;
    }
  | { id: string };

const findOrFetchUserByWebfinger = async (where: Where) => {
  const existingUser = await prisma.user.findFirst({ where });
  if (existingUser) {
    if (shouldReFetch(existingUser)) {
      return fetchUserByWebfinger({
        preferredUsername: existingUser.preferredUsername,
        host: existingUser.host,
        userIdForUpdate: existingUser.id,
      });
    }
    return existingUser;
  }
  if ("id" in where) {
    return null;
  }
  return fetchUserByWebfinger(where);
};

export const findOrFetchUserByParams = async (params: { userId: string }) => {
  const userId = decodeURIComponent(params.userId);
  if (userId.startsWith("@")) {
    const [preferredUsername, host] = userId.split("@").slice(1);
    if (!preferredUsername) {
      return null;
    }
    return findOrFetchUserByWebfinger({
      preferredUsername,
      host: host ?? env.HOST,
    });
  }
  return findOrFetchUserByWebfinger({ id: userId });
};
