import { inboxUndoService } from "@/server/service/inbox";

import type { InboxFunction } from "./types";

export const undo: InboxFunction = async (activity, actorUser) => {
  await inboxUndoService.handle(activity, actorUser);
  return {
    status: 200,
    message: "完了: アンフォロー",
  };
};
