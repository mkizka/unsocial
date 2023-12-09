"use client";
import type { FollowStatus } from "@prisma/client";
import { useTransition } from "react";

import { Spinner } from "@/_shared/components/ui/Spinner";

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
    <button
      className="ml-auto block h-9 w-24 whitespace-nowrap rounded bg-secondary  px-4 py-2 text-sm text-light shadow"
      data-testid="follow-button"
      onClick={() => startTransition(() => action({ followeeId }))}
    >
      <InnerText isLoading={isPending} followStatus={followStatus} />
    </button>
  );
}

type InnerTextProps = {
  isLoading: boolean;
  followStatus?: FollowStatus;
};

function InnerText({ isLoading, followStatus }: InnerTextProps) {
  if (isLoading) {
    return <Spinner />;
  }
  if (followStatus) {
    return FOLLOW_TEXT[followStatus];
  }
  return "フォロー";
}
