"use client";
import { HeartIcon as UnLikedIcon } from "@heroicons/react/24/outline";
import { HeartIcon as LikedIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

type Props = {
  isLiked: boolean;
  onClick: () => Promise<void>;
};

export function LikeButton({ isLiked: initialState, onClick }: Props) {
  // 表示上は即時反映させる
  const [isLiked, setIsLiked] = useState(initialState);
  return (
    <button
      data-testid="like-button"
      type="button"
      onClick={async () => {
        setIsLiked((prev) => !prev);
        await onClick();
      }}
      className="h-5 w-5 text-secondary transition-colors hover:text-secondary-dark"
    >
      {isLiked ? <LikedIcon /> : <UnLikedIcon />}
    </button>
  );
}
