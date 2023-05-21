"use client";
import { HeartIcon as UnLikedIcon } from "@heroicons/react/24/outline";
import { HeartIcon as LikedIcon } from "@heroicons/react/24/solid";
import { experimental_useOptimistic as useOptimistic } from "react";

import { action } from "./action.server";

type Props = {
  noteId: string;
  isLiked: boolean;
};

export function LikeButton({ noteId, isLiked }: Props) {
  // TODO: 期待通りの動作か確認
  const [optimisticIsLiked, toggleOptimisticIsLike] = useOptimistic(
    isLiked,
    (state) => !state
  );
  return (
    <button
      data-testid="like-button"
      onClick={async () => {
        toggleOptimisticIsLike(!optimisticIsLiked);
        await action(noteId);
      }}
      className="w-6 h-6 text-secondary hover:text-secondary-dark transition-colors"
    >
      {optimisticIsLiked ? <LikedIcon /> : <UnLikedIcon />}
    </button>
  );
}
