"use client";
import type { FollowStatus } from "@prisma/client";
import { useTransition } from "react";

import { action } from "./action.server";

type Props = {
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

export function FollowButton({ followeeId, followStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="block w-24 whitespace-nowrap rounded bg-secondary px-4 py-2 text-sm text-light shadow"
      data-testid={isPending ? "follow-button-loading" : "follow-button"}
      onClick={() => startTransition(() => action(followeeId))}
    >
      {followStatus ? FOLLOW_TEXT[followStatus] : "フォロー"}
    </button>
  );
}
