"use client";
import { useState } from "react";

import { NoteForm } from "@/components/features/note/NoteForm";
import type { noteService } from "@/server/service";

import { DeleteButton } from "./DeleteButton";
import { LikeButton } from "./LikeButton";
import { ReplyButton } from "./ReplyButton";

type Props = {
  note: Pick<noteService.NoteCard, "id" | "isLiked" | "isMine">;
};

export function Footer({ note }: Props) {
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
  return (
    <>
      <footer className="mt-3 flex gap-10 pl-[48px]">
        <ReplyButton onClick={() => setIsReplyFormOpen((prev) => !prev)} />
        <LikeButton noteId={note.id} isLiked={note.isLiked} />
        {note.isMine && <DeleteButton noteId={note.id} />}
      </footer>
      {isReplyFormOpen && <NoteForm replyToId={note.id} />}
    </>
  );
}
