"use client";
import { useTransition } from "react";

import { action } from "./action.server";

type Props = {
  noteId: string;
};

export function DeleteButton({ noteId }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      data-testid="delete-button"
      onClick={() => startTransition(() => action(noteId))}
      className="text-accent hover:text-accent-dark transition-colors"
    >
      {isPending ? "..." : "削除"}
    </button>
  );
}
