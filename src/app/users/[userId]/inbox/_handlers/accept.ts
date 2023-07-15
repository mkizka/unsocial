import { inboxAcceptService } from "@/server/service/inbox";

import type { InboxFunction } from "./types";

export const accept: InboxFunction = async (activity, followee) => {
  await inboxAcceptService.handle(activity, followee);
  return { status: 200, message: "完了: フォロー承認" };
};
