import { cache } from "react";

import type { PersonActivity } from "@/server/schema/person";
import { fetcher } from "@/utils/fetcher";
import { createDigest } from "@/utils/httpSignature/utils";
import { prisma } from "@/utils/prisma";

export const findByActorId = cache((actorId: URL) => {
  return prisma.user.findFirst({
    where: { actorUrl: actorId.toString() },
  });
});

export type FindUniqueParams =
  | {
      preferredUsername: string;
      host: string;
    }
  | { id: string }
  | { actorUrl: string };

export const findUnique = cache((params: FindUniqueParams) => {
  const where =
    "preferredUsername" in params ? { preferredUsername_host: params } : params;
  return prisma.user.findUnique({ where });
});

const fetchImageHash = async (url: string) => {
  const response = await fetcher(url);
  if (response instanceof Error) {
    return null;
  }
  const buffer = await response.arrayBuffer();
  return createDigest(new Uint8Array(buffer).toString());
};

export const createOrUpdateUser = async (
  person: PersonActivity,
  userIdForUpdate?: string,
) => {
  const data = {
    name: person.name,
    preferredUsername: person.preferredUsername,
    host: new URL(person.id).host,
    icon: person.icon?.url ?? null,
    iconHash: person.icon?.url ? await fetchImageHash(person.icon.url) : null,
    actorUrl: person.id,
    inboxUrl: person.endpoints?.sharedInbox ?? person.inbox,
    publicKey: person.publicKey.publicKeyPem,
    lastFetchedAt: new Date(),
  };
  return userIdForUpdate
    ? prisma.user.update({ where: { id: userIdForUpdate }, data })
    : prisma.user.create({ data });
};
