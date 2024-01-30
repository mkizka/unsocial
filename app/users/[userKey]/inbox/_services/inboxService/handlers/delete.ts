import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { prisma } from "@/_shared/utils/prisma";

import { ActivitySchemaValidationError } from "./errors";
import type { InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity) => {
  const parsedDelete = apSchemaService.deleteSchema.safeParse(activity);
  if (!parsedDelete.success) {
    return new ActivitySchemaValidationError(parsedDelete.error);
  }
  await prisma.note.deleteMany({
    where: {
      url: parsedDelete.data.object.id,
    },
  });
};
