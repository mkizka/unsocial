"use client";
import { useTransition } from "react";

import { Spinner } from "@/components/Spinner";

import { action } from "./action.server";

type Props = {
  userId: string;
};

export function RefetchButton({ userId }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="flex items-center"
      data-testid="follow-button"
      onClick={() => startTransition(() => action(userId))}
    >
      <div className="whitespace-nowrap">ユーザー情報を再取得</div>
      {isPending && (
        <div className="w-5 h-5">
          <Spinner />
        </div>
      )}
    </button>
  );
}
