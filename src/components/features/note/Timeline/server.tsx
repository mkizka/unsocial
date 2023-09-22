import { noteService } from "@/server/service";

import { ClientComponent } from "./client";

type Props = {
  userId?: string;
};

export async function Timeline({ userId }: Props) {
  const notes = await noteService.findManyNoteCards({ userId, count: 10 });
  return <ClientComponent firstLoadedNotes={notes} />;
}
