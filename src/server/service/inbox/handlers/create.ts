import { inboxCreateSchema } from "@/server/schema/create";
import { noteService } from "@/server/service";
import { ActivitySchemaValidationError } from "@/server/service/inbox/errors";
import { createLogger } from "@/utils/logger";

import { type InboxHandler } from "./shared";

const logger = createLogger("inboxCreateService");

export const handle: InboxHandler = async (activity) => {
  const parsedNote = inboxCreateSchema.safeParse(activity);
  if (!parsedNote.success) {
    return new ActivitySchemaValidationError(parsedNote.error, activity);
  }
  await noteService
    .createFromActivity(parsedNote.data.object)
    .catch((error) => {
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
      if (error.code === "P2002") {
        logger.info("すでに存在するノートを受信したのでスキップします");
        return;
      }
      return error;
    });
};
