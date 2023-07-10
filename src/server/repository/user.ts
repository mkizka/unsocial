import { cache } from "react";

import { prisma } from "@/utils/prisma";

import type { personSchema } from "../schema";

export const findByActorId = cache((actorId: URL) => {
  return prisma.user.findFirst({
    where: { actorUrl: actorId.toString() },
  });
});

export type FindFirstParams =
  | {
      preferredUsername: string;
      host: string;
    }
  | { id: string };

export const findFirst = cache((where: FindFirstParams) => {
  return prisma.user.findFirst({ where });
});

export const createOrUpdateUser = (
  person: personSchema.Person,
  userIdForUpdate?: string,
) => {
  const data = {
    name: person.name,
    preferredUsername: person.preferredUsername,
    host: new URL(person.id).host,
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
