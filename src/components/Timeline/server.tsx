import { noteService } from "@/server/service";

import { ClientComponent } from "./client";

export async function Timeline() {
  const notes = await noteService.findManyNoteCards({ count: 10 });
  return <ClientComponent firstLoadedNotes={notes} />;
}
