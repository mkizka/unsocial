import { inboxCreateService } from "@/server/service/inbox";

import type { InboxFunction } from "./types";

export const create: InboxFunction = async (activity, actorUser) => {
  await inboxCreateService.handle(activity, actorUser);
  return { status: 200, message: "完了: ノート作成" };
};
