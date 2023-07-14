import { followService } from "@/server/service/inbox";

import type { InboxFunction } from "./types";

// TODO: inboxのリファクタ終わったら消す
export const follow: InboxFunction = async (activity, actorUser) => {
  await followService.handle(activity, actorUser);
  return { status: 200, message: "完了: フォロー" };
};
