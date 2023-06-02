"use client";
import type { FollowStatus } from "@soshal/database";
import { useTransition } from "react";

import { action } from "./action.server";

type Props = {
  followeeId: string;
  followStatus?: FollowStatus;
};

const FOLLOW_TEXT = {
  SENT: "フォロー送信済み",
  ACCEPTED: "フォロー中",
  FAILED: "再フォロー", // TODO: 実装する
} as const satisfies {
  [key in FollowStatus]: string;
};

export function FollowButton({ followeeId, followStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      data-testid={isPending ? "follow-button-loading" : "follow-button"}
      onClick={() => startTransition(() => action(followeeId))}
    >
      {followStatus ? FOLLOW_TEXT[followStatus] : "フォロー"}
    </button>
  );
}
