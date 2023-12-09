import { inboxDeleteSchema } from "@/server/schema/delete";
import { ActivitySchemaValidationError } from "@/server/service/inbox/errors";
import { prisma } from "@/utils/prisma";

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
