import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";

import { ActivitySchemaValidationError } from "./errors";
import type { InboxHandler } from "./shared";

const logger = createLogger("inboxDeleteService");

export const handle: InboxHandler = async (activity) => {
  const parsedDelete = apSchemaService.deleteSchema.safeParse(activity);
  if (!parsedDelete.success) {
    return new ActivitySchemaValidationError(parsedDelete.error);
  }
  if (typeof parsedDelete.data.object === "string") {
    await prisma.user
      .delete({
        where: {
          actorUrl: parsedDelete.data.object,
        },
      })
      .catch((e) => {
        if (e.code === "P2025") {
          logger.info("削除対象のユーザーが無かったのでスキップ");
          return;
        }
        throw e;
      });
    return;
  }
  await prisma.note
    .delete({
      where: {
        url: parsedDelete.data.object.id,
      },
    })
    .catch((e) => {
      if (e.code === "P2025") {
        logger.info("削除対象のノートが無かったのでスキップ");
        return;
      }
      throw e;
    });
};
