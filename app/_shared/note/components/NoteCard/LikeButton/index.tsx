"use client";
import { HeartIcon as UnLikedIcon } from "@heroicons/react/24/outline";
import { HeartIcon as LikedIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

import { Button } from "@/_shared/ui/Button";

type Props = {
  isLiked: boolean;
  likesCount: number;
  onClick: () => Promise<void>;
};

export function LikeButton({
  isLiked: initialIsLiked,
  likesCount: initialLikesCount,
  onClick,
}: Props) {
  // 表示上は即時反映させる
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCound, setLikesCount] = useState(initialLikesCount);
  return (
    <Button
      variant="ghost"
      size="icon"
      data-testid="like-button"
      type="button"
      onClick={async () => {
        setIsLiked((prev) => !prev);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
        await onClick();
      }}
    >
      {isLiked ? (
        <LikedIcon className="size-5 text-primary transition-colors" />
      ) : (
        <UnLikedIcon className="size-5 text-primary transition-colors" />
      )}
      <div className="absolute left-8">{likesCound}</div>
    </Button>
  );
}
