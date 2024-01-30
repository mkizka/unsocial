import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { noteCreateService } from "@/_shared/note/services/noteCreateService";

import { ActivitySchemaValidationError } from "./errors";
import { type InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity) => {
  const parsedNote = apSchemaService.createSchema.safeParse(activity);
  if (!parsedNote.success) {
    return new ActivitySchemaValidationError(parsedNote.error);
  }
  await noteCreateService.create(parsedNote.data.object);
};
