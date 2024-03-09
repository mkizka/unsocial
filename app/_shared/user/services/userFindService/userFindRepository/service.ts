import type { Prisma } from "@prisma/client";
import { fromZodError } from "zod-validation-error";

import { apFetchService } from "@/_shared/activitypub/apFetchService";
import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { ActorValidationError } from "@/_shared/user/services/userFindService/errors";
import { getIconHash } from "@/_shared/utils/icon";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";

const logger = createLogger("userFindRepository");

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
    logger.info(
      "Actorの検証に失敗しました: " + fromZodError(parsed.error).toString(),
    );
    return new ActorValidationError();
  }
  return parsed.data;
};
