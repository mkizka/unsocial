import { z } from "zod";

import { prisma } from "../server/db";
import { env } from "../utils/env";
import { fetchJson } from "./fetchJson";
import { formatZodError } from "./formatZodError";
import { logger } from "./logger";

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

const fetchActorIdByWebFinger = async (
  preferredUsername: string,
  host: string
) => {
  const remoteUrl = safeUrl(`https://${host}`);
  if (!remoteUrl) {
    logger.info(`https://${host}がURLとして不正でした`);
    return null;
  }
  const webFingerUrl = new URL("/.well-known/webfinger", remoteUrl);
  webFingerUrl.searchParams.append(
    "resource",
    `acct:${preferredUsername}@${host}`
  );
  const response = await fetchJson(webFingerUrl);
  if (!response) {
    return null;
  }
  return resolveWebFingerResponse(response.body);
};

const personSchema = z.object({
  id: z.string().url(),
  name: z.string().nullable(),
  preferredUsername: z.string().min(1),
  inbox: z.string().url(),
  icon: z
    .object({
      url: z.string(),
    })
    .nullable()
    .optional(),
  publicKey: z.object({
    publicKeyPem: z.string(),
  }),
});

const fetchValidPerson = async (url: URL) => {
  const response = await fetchJson(url, {
    headers: {
      accept: "application/activity+json",
    },
  });
  const parsed = personSchema.safeParse(response?.body);
  if (!parsed.success) {
    logger.info("検証失敗: " + formatZodError(parsed.error));
    return null;
  }
  return parsed.data;
};

const fetchUserByActorId = async (actorId: URL) => {
  const person = await fetchValidPerson(actorId);
  if (!person) {
    return null;
  }
  return prisma.user.create({
    data: {
      name: person.name,
      preferredUsername: person.preferredUsername,
      host: actorId.host,
      //image: person.image.url,
      //icon: person.icon.url,
      actorUrl: person.id,
      inboxUrl: person.inbox,
      publicKey: person.publicKey.publicKeyPem,
    },
  });
};

export const findOrFetchUserByActorId = async (actorId: URL) => {
  const existingUser = await prisma.user.findFirst({
    where: { actorUrl: actorId.toString() },
  });
  if (existingUser) {
    return existingUser;
  }
  return fetchUserByActorId(actorId);
};

export const findOrFetchUserByWebfinger = async (
  preferredUsername: string,
  host: string
) => {
  const existingUser = await prisma.user.findFirst({
    where: { preferredUsername, host },
  });
  if (existingUser) {
    return existingUser;
  }
  const actorId = await fetchActorIdByWebFinger(preferredUsername, host);
  if (!actorId) {
    return null;
  }
  return fetchUserByActorId(actorId);
};
