import type { User } from "@prisma/client";

export type InboxFunction = (
  activity: unknown,
  actorUser: User
) => Promise<{
  status: number;
  message: string;
}>;
