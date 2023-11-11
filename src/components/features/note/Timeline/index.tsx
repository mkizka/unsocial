import { notFound } from "next/navigation";

import { noteService } from "@/server/service";
import { userService } from "@/server/service/user";

import { TimelineLoader } from "./TimelineLoader";

type Props = {
  userKey?: string;
};

const getUserIdOrUndefined = async (userKey?: string) => {
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
  const userId = await getUserIdOrUndefined(userKey);
  const firstLoadedNotes = await noteService.findManyNoteCards({
    userId,
    count: 30,
  });
  return (
    <section className="flex w-full justify-center">
      <TimelineLoader firstLoadedNotes={firstLoadedNotes} userId={userId} />
    </section>
  );
}
