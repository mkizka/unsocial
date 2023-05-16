"use client";
import { useTransition } from "react";

import { action } from "./action.server";

type Props = {
  noteId: string;
  isLiked: boolean;
};

export function LikeButton({ noteId, isLiked }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      data-testid="like-button"
      onClick={() => startTransition(() => action(noteId))}
    >
      {isPending ? "..." : isLiked ? "👍" : "-"}
    </button>
  );
}
