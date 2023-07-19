import { noteRepository } from "@/server/repository";
import { inboxCreateSchema } from "@/server/schema/create";

import { ActivitySchemaValidationError } from "../errors";
import { type InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedNote = inboxCreateSchema.safeParse(activity);
  if (!parsedNote.success) {
    return new ActivitySchemaValidationError(activity, parsedNote.error);
  }
  await noteRepository.createFromActivity({
    activity: parsedNote.data.object,
    userId: actorUser.id,
  });
};
