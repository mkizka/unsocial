import type { User } from "@soshal/database";

export type InboxFunction = (
  activity: unknown,
  actorUser: User
) => Promise<{
  status: number;
  message: string;
}>;
