"use client";
import { HeartIcon as UnLikedIcon } from "@heroicons/react/24/outline";
import { HeartIcon as LikedIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

import { Button } from "@/_shared/ui/Button";

type Props = {
  isLiked: boolean;
  onClick: () => Promise<void>;
};

export function LikeButton({ isLiked: initialState, onClick }: Props) {
  // 表示上は即時反映させる
  const [isLiked, setIsLiked] = useState(initialState);
  return (
    <Button
      variant="ghost"
      size="icon"
      data-testid="like-button"
      type="button"
      onClick={async () => {
        setIsLiked((prev) => !prev);
        await onClick();
      }}
    >
      {isLiked ? (
        <LikedIcon className="size-5 text-primary transition-colors" />
      ) : (
        <UnLikedIcon className="size-5 text-primary transition-colors" />
      )}
    </Button>
  );
}
