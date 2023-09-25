import { notFound } from "next/navigation";

import { userService } from "@/server/service";

import { TimelineLoader } from "./TimelineLoader";

type Props = {
  userKey?: string;
};

const getUserId = async (userKey?: string) => {
  if (!userKey) {
    return undefined;
  }
  const user = await userService.findOrFetchUserByKey(userKey);
  if (user instanceof Error) {
    notFound();
  }
  return user.id;
};

export async function Timeline({ userKey }: Props) {
  const userId = await getUserId(userKey);
  return (
    <section className="flex w-full justify-center">
      <TimelineLoader userId={userId} />
    </section>
  );
}
