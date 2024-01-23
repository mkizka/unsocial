"use client";
import type { FollowStatus } from "@prisma/client";
import { useTransition } from "react";

import { Button } from "@/_shared/ui/Button";

import { action } from "./action";

type FollowButtonProps = {
  followeeId: string;
  followStatus?: FollowStatus;
};

const FOLLOW_TEXT = {
  SENT: "承認待ち",
  ACCEPTED: "フォロー中",
  FAILED: "再フォロー", // TODO: 実装する
} as const satisfies {
  [key in FollowStatus]: string;
};

export function FollowButton({ followeeId, followStatus }: FollowButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="ml-auto"
      variant="default"
      data-testid="follow-button"
      loading={isPending}
      onClick={() => startTransition(() => action({ followeeId }))}
    >
      {followStatus ? FOLLOW_TEXT[followStatus] : "フォロー"}
    </Button>
  );
}
