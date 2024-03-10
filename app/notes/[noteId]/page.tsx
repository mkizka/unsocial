import { notFound } from "next/navigation";
import { Fragment } from "react";

import { NoteCardContainer } from "@/_shared/note/components/NoteCard";
import { NoteForm } from "@/_shared/note/components/NoteForm";
import { noteCardFindService } from "@/_shared/note/services/noteCardFindService";

import { LikeUserList } from "./_components/LikeUserList";

type Params = {
  noteId: string;
};

export async function generateMetadata({ params }: { params: Params }) {
  const note = await noteCardFindService.findUniqueNoteCard(params.noteId);
  if (!note) {
    notFound();
  }
  return {
    title: `${note.user.name}(@${note.user.preferredUsername})さんの投稿: ${note.content}`,
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: { reply?: string };
}) {
  const note = await noteCardFindService.findUniqueNoteCard(params.noteId);
  if (!note) {
    notFound();
  }
  return (
    <div className="space-y-1">
      {note.replyTo && <NoteCardContainer note={note.replyTo} />}
      <NoteCardContainer note={note} showDetail />
      <LikeUserList users={note.likes.map((like) => like.user)} />
      {"reply" in searchParams && <NoteForm replyToId={note.id} autoFocus />}
      {note.replies.map((reply) => (
        <Fragment key={reply.id}>
          <NoteCardContainer
            note={reply}
            withReplyLink={reply.replies.length > 0}
          />
        </Fragment>
      ))}
    </div>
  );
}
