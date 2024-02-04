"use client";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { Button } from "@/_shared/ui/Button";
import { cn } from "@/_shared/utils/cn";

type Props = {
  isReposted: boolean;
  onClick: () => Promise<void>;
};

export function RepostButton({ isReposted: initialState, onClick }: Props) {
  // 表示上は即時反映させる
  const [isReposted, setIsReposted] = useState(initialState);
  return (
    <Button
      variant="ghost"
      size="icon"
      data-testid="repost-button"
      type="button"
      onClick={async () => {
        setIsReposted((prev) => !prev);
        await onClick();
      }}
    >
      <ArrowPathIcon
        className={cn("size-5 transition-colors", {
          "text-primary": isReposted,
        })}
      />
    </Button>
  );
}
