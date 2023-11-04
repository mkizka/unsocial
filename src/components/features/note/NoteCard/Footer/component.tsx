"use client";
import type { noteService } from "@/server/service";

import { DeleteButton } from "./DeleteButton";
import { LikeButton } from "./LikeButton";
import { ReplyButton } from "./ReplyButton";

type Props = {
  note: Pick<noteService.NoteCard, "id" | "isLiked" | "isMine">;
};

export function Footer({ note }: Props) {
  return (
    <div className="mt-3 flex gap-10">
      <ReplyButton noteId={note.id} />
      <LikeButton noteId={note.id} isLiked={note.isLiked} />
      {note.isMine && <DeleteButton noteId={note.id} />}
    </div>
  );
}
