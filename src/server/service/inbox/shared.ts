import type { User } from "@prisma/client";

export type ActivityHandler = (
  activity: unknown,
  actorUser: User,
) => Promise<{
  ok: boolean;
  message: string;
}>;

export const resolveNoteId = (objectId: URL) => {
  if (!objectId.pathname.startsWith("/notes/")) {
    return null;
  }
  return objectId.pathname.split("/")[2];
};
