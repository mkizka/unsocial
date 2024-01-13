import { notFound } from "next/navigation";

import { noteCardFindService } from "@/_shared/note/services/noteCardFindService";
import { userFindService } from "@/_shared/service/user";

import { TimelineLoader } from "./TimelineLoader";

type Props = {
  userKey?: string;
};

const getUserIdOrUndefined = async (userKey?: string) => {
  if (!userKey) {
    return undefined;
  }
  const user = await userFindService.findOrFetchUserByKey(userKey);
  if (user instanceof Error) {
    notFound();
  }
  return user.id;
};

export async function Timeline({ userKey }: Props) {
  const userId = await getUserIdOrUndefined(userKey);
  const firstLoadedNotes = await noteCardFindService.findManyNoteCards({
    userId,
    count: 30,
  });
  return (
    <section className="flex w-full justify-center">
      <TimelineLoader firstLoadedNotes={firstLoadedNotes} userId={userId} />
    </section>
  );
}
