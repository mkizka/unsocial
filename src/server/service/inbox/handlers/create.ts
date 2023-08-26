import { noteRepository } from "@/server/repository";
import { inboxCreateSchema } from "@/server/schema/create";
import { createLogger } from "@/utils/logger";

import { ActivitySchemaValidationError } from "../errors";
import { type InboxHandler } from "./shared";

const logger = createLogger("inboxCreateService");

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedNote = inboxCreateSchema.safeParse(activity);
  if (!parsedNote.success) {
    return new ActivitySchemaValidationError(parsedNote.error, activity);
  }
  await noteRepository
    .createFromActivity({
      activity: parsedNote.data.object,
      userId: actorUser.id,
    })
    .catch((error) => {
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
      if (error.code === "P2002") {
        logger.info("すでに存在するノートを受信したのでスキップします");
        return;
      }
    });
};
