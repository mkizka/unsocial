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
      className={`text-sm mt-2 ${isLiked ? "text-red-500" : "text-gray-500"}`}
    >
      {isPending ? "..." : isLiked ? "👍" : "-"}
    </button>
  );
}
