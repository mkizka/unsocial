import { notFound } from "next/navigation";

import { NoteCard } from "@/components/features/note/NoteCard";
import { UserList } from "@/components/server/UserList";
import { noteService } from "@/server/service";

export default async function NotePage({
  params,
}: {
  params: { noteId: string };
}) {
  const note = await noteService.findUniqueNoteCard(params.noteId);
  if (!note) {
    return notFound();
  }
  return (
    <main className="pt-5">
      <NoteCard note={note} />
      <UserList users={note.likes.map((like) => like.user)} />
    </main>
  );
}
