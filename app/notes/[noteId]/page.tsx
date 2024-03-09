import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";

import { NoteCardContainer } from "@/_shared/note/components/NoteCard";
import { NoteForm } from "@/_shared/note/components/NoteForm";
import { noteCardFindService } from "@/_shared/note/services/noteCardFindService";
import { env } from "@/_shared/utils/env";

import { LikeUserList } from "./_components/LikeUserList";

export default async function Page({
  params,
  searchParams,
}: {
  params: { noteId: string };
  searchParams: { reply?: string };
}) {
  const note = await noteCardFindService.findUniqueNoteCard(params.noteId);
  if (!note) {
    notFound();
  }
  if (headers().get("accept") === "application/activity+json") {
    redirect(`https://${env.UNSOCIAL_HOST}/notes/${note.id}/activity`);
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
