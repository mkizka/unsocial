import { inboxDeleteSchema } from "@/_shared/schema/delete";
import { prisma } from "@/_shared/utils/prisma";

import { ActivitySchemaValidationError } from "./errors";
import type { InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity) => {
  const parsedDelete = inboxDeleteSchema.safeParse(activity);
  if (!parsedDelete.success) {
    return new ActivitySchemaValidationError(parsedDelete.error, activity);
  }
  await prisma.note.deleteMany({
    where: {
      url: parsedDelete.data.object.id,
    },
  });
};
