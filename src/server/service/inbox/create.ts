import { noteRepository } from "@/server/repository";
import { createSchema } from "@/server/schema";

import { ActivitySchemaValidationError, type InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedNote = createSchema.safeParse(activity);
  if (!parsedNote.success) {
    return new ActivitySchemaValidationError(activity, parsedNote.error);
  }
  await noteRepository.createFromActivity({
    activity: parsedNote.data.object,
    userId: actorUser.id,
  });
};
