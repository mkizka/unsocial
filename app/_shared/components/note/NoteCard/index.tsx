"use client";
import { action as deleteAction } from "./DeleteButton/action";
import { action as likeAction } from "./LikeButton/action";
import { NoteCard, type NoteCardProps } from "./NoteCard";

type Props = Omit<NoteCardProps, "onLike" | "onDelete">;

export function NoteCardContainer(props: Props) {
  return (
    <NoteCard
      {...props}
      onLike={() => likeAction({ noteId: props.note.id, content: "👍" })}
      onDelete={() => deleteAction(props.note.id)}
    />
  );
}
