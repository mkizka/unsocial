"use client";
import type { Follow, FollowStatus } from "@prisma/client";
import { useTransition } from "react";

type Props = {
  follow: Pick<Follow, "status"> | null;
  onClick: () => Promise<void>;
};

const FOLLOW_TEXT = {
  SENT: "フォロー送信済み",
  ACCEPTED: "フォロー中",
  FAILED: "再フォロー", // TODO: 実装する
} as const satisfies {
  [key in FollowStatus]: string;
};

export function FollowButton({ follow, onClick }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      data-testid={isPending ? "follow-button-loading" : "follow-button"}
      onClick={() => startTransition(() => onClick())}
    >
      {follow ? FOLLOW_TEXT[follow.status] : "フォロー"}
    </button>
  );
}
