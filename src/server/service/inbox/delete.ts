import { noteRepository } from "@/server/repository";
import { deleteSchema } from "@/server/schema";

import type { InboxHandler } from "./shared";
import { ActivitySchemaValidationError } from "./shared";

export const handle: InboxHandler = async (activity) => {
  const parsedDelete = deleteSchema.safeParse(activity);
  if (!parsedDelete.success) {
    return new ActivitySchemaValidationError(activity, parsedDelete.error);
  }
  await noteRepository.removeByActivity(parsedDelete.data);
};
