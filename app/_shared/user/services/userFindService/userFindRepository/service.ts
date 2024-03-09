import type { Prisma } from "@prisma/client";
import { fromZodError } from "zod-validation-error";

import { apFetchService } from "@/_shared/activitypub/apFetchService";
import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { getIconHash } from "@/_shared/utils/icon";
import { prisma } from "@/_shared/utils/prisma";

export const createOrUpdateUser = (
  person: apSchemaService.PersonActivity,
  userIdForUpdate?: string,
) => {
  const data = {
    name: person.name,
    preferredUsername: person.preferredUsername,
    summary: person.summary,
    host: new URL(person.id).host,
    icon: person.icon?.url ?? null,
    iconHash: person.icon?.url ? getIconHash(person.icon.url) : null,
    actorUrl: person.id,
    inboxUrl: person.endpoints?.sharedInbox ?? person.inbox,
    publicKey: person.publicKey.publicKeyPem,
    lastFetchedAt: new Date(),
  } satisfies Prisma.UserCreateInput;
  return userIdForUpdate
    ? prisma.user.update({ where: { id: userIdForUpdate }, data })
    : prisma.user.create({ data });
};

export const fetchPersonByActorUrl = async (
  actorUrl: string,
): Promise<apSchemaService.PersonActivity | Error> => {
  const response = await apFetchService.fetchActivity(actorUrl);
  if (response instanceof Error) {
    return response;
  }
  const parsed = apSchemaService.personSchema.safeParse(response);
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }
  return parsed.data;
};
