"use client";
import { action as deleteAction } from "./DeleteButton/action";
import { action as likeAction } from "./LikeButton/action";
import { NoteCard, type NoteCardProps } from "./NoteCard";
import { action as repostAction } from "./RepostButton/action";

type Props = Omit<NoteCardProps, "onRepost" | "onLike" | "onDelete">;

export function NoteCardContainer(props: Props) {
  return (
    <NoteCard
      {...props}
      onRepost={() => repostAction({ noteId: props.note.id })}
      onLike={() => likeAction({ noteId: props.note.id, content: "👍" })}
      onDelete={() => deleteAction(props.note.id)}
    />
  );
}
