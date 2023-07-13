import { likeService } from "@/server/service/inbox";

import type { InboxFunction } from "./types";

export const like: InboxFunction = async (activity, actorUser) => {
  const response = await likeService.handle(activity, actorUser);
  return { status: response.ok ? 200 : 400, message: response.message };
};
