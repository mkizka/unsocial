import { likeRepository } from "@/server/repository";
import { likeSchema } from "@/server/schema";
import { stringifyZodError } from "@/utils/formatZodError";

import { type ActivityHandler, resolveNoteId } from "./shared";

export const handle: ActivityHandler = async (activity, actorUser) => {
  const parsedLike = likeSchema.safeParse(activity);
  if (!parsedLike.success) {
    return {
      ok: false,
      message: stringifyZodError(parsedLike.error, activity),
    };
  }
  const noteId = resolveNoteId(new URL(parsedLike.data.object));
  if (!noteId) {
    return {
      ok: false,
      message: "activityからいいね対象のノートIDを取得できませんでした",
    };
  }
  await likeRepository.create({
    noteId,
    userId: actorUser.id,
    content: parsedLike.data.content ?? "👍",
  });
  return { ok: true, message: "完了: いいね" };
};
