import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { noteCreateService } from "@/_shared/note/services/noteCreateService";
import { createLogger } from "@/_shared/utils/logger";

import { ActivitySchemaValidationError } from "./errors";
import { type InboxHandler } from "./shared";

const logger = createLogger("inboxCreateService");

export const handle: InboxHandler = async (activity) => {
  const parsedNote = apSchemaService.createSchema.safeParse(activity);
  if (!parsedNote.success) {
    return new ActivitySchemaValidationError(parsedNote.error);
  }
  await noteCreateService.create(parsedNote.data.object).catch((error) => {
    // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
    if (error.code === "P2002") {
      logger.info("すでに存在するノートを受信したのでスキップします");
      return;
    }
    return error;
  });
};
