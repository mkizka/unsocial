"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

import { Spinner } from "@/components/Spinner";

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
      className="text-accent hover:text-accent-dark w-5 h-5 transition-colors"
    >
      {isPending ? <Spinner /> : <XMarkIcon />}
    </button>
  );
}
