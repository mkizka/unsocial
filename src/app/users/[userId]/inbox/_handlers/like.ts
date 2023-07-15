import { inboxLikeService } from "@/server/service/inbox";

import type { InboxFunction } from "./types";

// TODO: inboxのリファクタ終わったら消す
export const like: InboxFunction = async (activity, actorUser) => {
  await inboxLikeService.handle(activity, actorUser);
  return { status: 200, message: "完了: いいね" };
};
