import { json } from "next-runtime";
import { z } from "zod";

import { prisma } from "../../../../server/db";
import { formatZodError } from "../../../../utils/formatZodError";
import { logger } from "../../../../utils/logger";
import type { InboxFunction } from "./types";

const noteSchema = z.object({
  type: z.literal("Create"),
  actor: z.string().url(),
  object: z.object({
    type: z.literal("Note"),
    id: z.string().url(),
    content: z.string(),
    published: z.string().datetime(),
  }),
});

export const create: InboxFunction = async (activity, actorUser) => {
  const parsedNote = noteSchema.safeParse(activity);
  if (!parsedNote.success) {
    logger.info("検証失敗: " + formatZodError(parsedNote.error));
    return json({}, 400);
  }
  await prisma.note.create({
    data: {
      url: parsedNote.data.object.id,
      userId: actorUser.id,
      content: parsedNote.data.object.content,
      published: parsedNote.data.object.published,
    },
  });
  logger.info("完了: ノート");
  return json({}, 200);
};
