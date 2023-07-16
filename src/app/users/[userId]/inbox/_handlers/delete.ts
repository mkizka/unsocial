import { inboxDeleteService } from "@/server/service/inbox";

import type { InboxFunction } from "./types";

export const delete_: InboxFunction = async (activity, actorUser) => {
  await inboxDeleteService.handle(activity, actorUser);
  return { status: 200, message: "完了: ノート削除" };
};
