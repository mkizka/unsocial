import { prisma } from "@soshal/database";
import { formatZodError } from "@soshal/utils";
import { z } from "zod";

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
    return {
      status: 400,
      message: "検証失敗: " + formatZodError(parsedNote.error),
    };
  }
  // urlはユニークでないのでdeleteManyを使うが、実際は一つのノートのみ削除されるはず
  await prisma.note.deleteMany({
    where: {
      url: parsedNote.data.object.id,
    },
  });
  return { status: 200, message: "完了: ノート削除" };
};
