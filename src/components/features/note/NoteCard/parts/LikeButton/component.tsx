"use client";
import { HeartIcon as UnLikedIcon } from "@heroicons/react/24/outline";
import { HeartIcon as LikedIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

import { action } from "./action";

type Props = {
  noteId: string;
  isLiked: boolean;
};

export function LikeButton({ noteId, isLiked: initialState }: Props) {
  // 表示上は即時反映させる
  const [isLiked, setIsLiked] = useState(initialState);
  return (
    <button
      data-testid="like-button"
      type="button"
      onClick={() => {
        setIsLiked((prev) => !prev);
        action({ noteId, content: "👍" });
      }}
      className="h-5 w-5 text-secondary transition-colors hover:text-secondary-dark"
    >
      {isLiked ? <LikedIcon /> : <UnLikedIcon />}
    </button>
  );
}
