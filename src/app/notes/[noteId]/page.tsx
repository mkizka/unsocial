import { notFound } from "next/navigation";
import { Fragment } from "react";

import { NoteCard } from "@/app/_shared/components/note/NoteCard";
import { NoteForm } from "@/app/_shared/components/note/NoteForm";
import { noteService } from "@/server/service";

import { LikeUserList } from "./_components/LikeUserList";

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
      <LikeUserList users={note.likes.map((like) => like.user)} />
      {"reply" in searchParams && <NoteForm replyToId={note.id} autoFocus />}
      {note.replies.map((reply) => (
        <Fragment key={reply.id}>
          <NoteCard note={reply} withReplyLink={reply.replies.length > 0} />
        </Fragment>
      ))}
    </div>
  );
}
