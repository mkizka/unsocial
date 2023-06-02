import { prisma } from "@soshal/database";
import { z } from "zod";

import { formatZodError } from "@/utils/formatZodError";

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
    return {
      status: 400,
      message: "検証失敗: " + formatZodError(parsedNote.error),
    };
  }
  await prisma.note.create({
    data: {
      url: parsedNote.data.object.id,
      userId: actorUser.id,
      content: parsedNote.data.object.content,
      published: parsedNote.data.object.published,
    },
  });
  return { status: 200, message: "完了: ノート作成" };
};
