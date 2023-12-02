import { notFound } from "next/navigation";
import { Fragment } from "react";

import { NoteCard } from "@/components/features/note/NoteCard";
import { NoteForm } from "@/components/features/note/NoteForm";
import { UserList } from "@/components/ui/UserList";
import { noteService } from "@/server/service";

export default async function Page({
  params,
  searchParams,
}: {
  params: { noteId: string };
  searchParams: { reply?: string };
}) {
  const note = await noteService.findUniqueNoteCard(params.noteId);
  if (!note) {
    notFound();
  }
  return (
    <div className="space-y-1">
      {note.replyTo && <NoteCard note={note.replyTo} />}
      <NoteCard note={note} showDetail />
      <UserList users={note.likes.map((like) => like.user)} />
      {"reply" in searchParams && <NoteForm replyToId={note.id} autoFocus />}
      {note.replies.map((reply) => (
        <Fragment key={reply.id}>
          <NoteCard note={reply} withReplyLink={reply.replies.length > 0} />
        </Fragment>
      ))}
    </div>
  );
}
