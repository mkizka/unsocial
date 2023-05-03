import { json } from "next-runtime";
import { z } from "zod";

import { prisma } from "../../../../server/db";
import { formatZodError } from "../../../../utils/formatZodError";
import { logger } from "../../../../utils/logger";
import type { InboxFunction } from "./types";

const deleteSchema = z.object({
  type: z.literal("Delete"),
  actor: z.string().url(),
  object: z.object({
    type: z.literal("Tombstone"),
    id: z.string().url(),
  }),
});

export const delete_: InboxFunction = async (activity) => {
  const parsedNote = deleteSchema.safeParse(activity);
  if (!parsedNote.success) {
    logger.info("検証失敗: " + formatZodError(parsedNote.error));
    return json({}, 400);
  }
  try {
    // urlはユニークでないのでdeleteManyを使うが、実際は一つのノートのみ削除されるはず
    await prisma.note.deleteMany({
      where: {
        url: parsedNote.data.object.id,
      },
    });
  } catch (e) {
    logger.error(`ノートの削除に失敗しました: ${e}`);
    return json({}, 500);
  }
  logger.info("完了: ノート削除");
  return json({}, 200);
};
