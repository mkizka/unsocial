"use client";
import { useTransition } from "react";

type Props = {
  onClick: () => Promise<void>;
};

export function DeleteButton({ onClick }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      data-testid="delete-button"
      onClick={() => startTransition(() => onClick())}
    >
      {isPending ? "..." : "削除"}
    </button>
  );
}
