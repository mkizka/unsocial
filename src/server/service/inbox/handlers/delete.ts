import { noteRepository } from "@/server/repository";
import { inboxDeleteSchema } from "@/server/schema/delete";

import { ActivitySchemaValidationError } from "../errors";
import type { InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity) => {
  const parsedDelete = inboxDeleteSchema.safeParse(activity);
  if (!parsedDelete.success) {
    return new ActivitySchemaValidationError(activity, parsedDelete.error);
  }
  await noteRepository.removeByActivity(parsedDelete.data);
};
