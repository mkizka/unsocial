"use client";
import { useTransition } from "react";

type Props = {
  isLiked: boolean;
  onClick: () => Promise<void>;
};

export function LikeButton({ isLiked, onClick }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      data-testid="like-button"
      onClick={() => startTransition(() => onClick())}
    >
      {isPending ? "..." : isLiked ? "👍" : "-"}
    </button>
  );
}
