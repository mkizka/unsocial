import type { User } from "@prisma/client";

import { noteCardFindService } from "@/_shared/note/services/noteCardFindService";

import { TimelineLoader } from "./TimelineLoader";

type Props = {
  user?: User;
};

export async function Timeline({ user }: Props) {
  const userId = user?.id;
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
