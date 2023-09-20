import type { User } from "@prisma/client";

import type { InboxError } from "@/server/service/inbox/errors";

export type InboxHandler = (
  activity: unknown,
  actorUser: User,
) => Promise<InboxError | void>;

export const resolveNoteId = (objectId: URL) => {
  if (!objectId.pathname.startsWith("/notes/")) {
    return null;
  }
  return objectId.pathname.split("/")[2];
};
