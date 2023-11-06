import { notFound } from "next/navigation";

import { NoteCard } from "@/components/features/note/NoteCard";
import { NoteForm } from "@/components/features/note/NoteForm";
import { UserList } from "@/components/ui/UserList";
import { noteService } from "@/server/service";

type Props = {
  noteId: string;
  shouldFocusToReplyForm?: boolean;
};

export async function NotePage({ noteId, shouldFocusToReplyForm }: Props) {
  const note = await noteService.findUniqueNoteCard(noteId);
  if (!note) {
    return notFound();
  }
  return (
    <>
      <NoteCard note={note} />
      <UserList users={note.likes.map((like) => like.user)} />
      <NoteForm replyToId={note.id} autoFocus={shouldFocusToReplyForm} />
    </>
  );
}
