import { inboxCreateSchema } from "@/_shared/schema/create";
import { createNoteActivityService } from "@/_shared/service/creacteNoteFromActivityService";
import { ActivitySchemaValidationError } from "@/_shared/service/inbox/errors";
import { createLogger } from "@/_shared/utils/logger";

import { type InboxHandler } from "./shared";

const logger = createLogger("inboxCreateService");

export const handle: InboxHandler = async (activity) => {
  const parsedNote = inboxCreateSchema.safeParse(activity);
  if (!parsedNote.success) {
    return new ActivitySchemaValidationError(parsedNote.error, activity);
  }
  await createNoteActivityService
    .create(parsedNote.data.object)
    .catch((error) => {
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
      if (error.code === "P2002") {
        logger.info("すでに存在するノートを受信したのでスキップします");
        return;
      }
      return error;
    });
};
