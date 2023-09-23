import { notFound } from "next/navigation";

import { userService } from "@/server/service";

import { TimelineLoader } from "./TimelineLoader";

type Props = {
  userKey?: string;
};

export async function Timeline({ userKey }: Props) {
  if (!userKey) {
    return <TimelineLoader />;
  }
  const user = await userService.findOrFetchUserByKey(userKey);
  if (user instanceof Error) {
    notFound();
  }
  return <TimelineLoader userId={user.id} />;
}
