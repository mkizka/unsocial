import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";

import { NoteCard } from "@/components/features/note/NoteCard";
import { NoteForm } from "@/components/features/note/NoteForm";
import { Card } from "@/components/ui/Card";
import { UserList } from "@/components/ui/UserList";
import { noteService } from "@/server/service";

type Props = {
  noteId: string;
  shouldShowReplyForm?: boolean;
};

export async function NotePage({ noteId, shouldShowReplyForm }: Props) {
  const note = await noteService.findUniqueNoteCard(noteId);
  if (!note) {
    return notFound();
  }
  return (
    <>
      {note.replyTo && <NoteCard note={note.replyTo} />}
      <NoteCard note={note} showDetail />
      <UserList users={note.likes.map((like) => like.user)} />
      {shouldShowReplyForm && <NoteForm replyToId={note.id} autoFocus />}
      {note.replies.map((reply) => {
        <Fragment key={reply.id}>
          <NoteCard note={reply} />
          {reply.replies.length > 0 && (
            <Link href={`/notes/${reply.replies[0]!.id}`}>
              <Card className="py-2 pl-6 text-gray hover:underline">
                返信を表示
              </Card>
            </Link>
          )}
        </Fragment>;
      })}
    </>
  );
}
