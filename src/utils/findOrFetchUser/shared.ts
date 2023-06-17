import type { User } from "@prisma/client";
import { z } from "zod";

import { env } from "../env";
import { fetchJson } from "../fetchJson";
import { formatZodError } from "../formatZodError";
import { logger } from "../logger";
import { prisma } from "../prisma";

export const shouldReFetch = (user: User) => {
  if (user.host == env.HOST) {
    return false;
  }
  if (!user.lastFetchedAt) {
    return true;
  }
  const diff = Date.now() - user.lastFetchedAt.getTime();
  return diff >= 1000 * 60 * 60 * 3;
};

const personSchema = z.object({
  id: z.string().url(),
  name: z.string().nullable(),
  preferredUsername: z.string().min(1),
  endpoints: z
    .object({
      sharedInbox: z.string().url().optional(),
    })
    .optional(),
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
  const parsed = personSchema.safeParse(response);
  if (!parsed.success) {
    logger.info("検証失敗: " + formatZodError(parsed.error));
    return null;
  }
  return parsed.data;
};

export const fetchUserByActorId = async ({
  actorId,
  userIdForUpdate,
}: {
  actorId: URL;
  userIdForUpdate?: string;
}) => {
  const person = await fetchValidPerson(actorId);
  if (!person) {
    return null;
  }
  const data = {
    name: person.name,
    preferredUsername: person.preferredUsername,
    host: actorId.host,
    icon: person.icon?.url ?? null,
    actorUrl: person.id,
    inboxUrl: person.endpoints?.sharedInbox ?? person.inbox,
    publicKey: person.publicKey.publicKeyPem,
    lastFetchedAt: new Date(),
  };
  return userIdForUpdate
    ? prisma.user.update({ where: { id: userIdForUpdate }, data })
    : prisma.user.create({ data });
};
