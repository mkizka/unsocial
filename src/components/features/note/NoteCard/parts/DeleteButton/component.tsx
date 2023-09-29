"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

import { Spinner } from "@/components/clients/Spinner";

import { action } from "./action";

type Props = {
  noteId: string;
};

export function DeleteButton({ noteId }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      data-testid="delete-button"
      onClick={() => startTransition(() => action(noteId))}
      className="h-5 w-5 text-accent transition-colors hover:text-accent-dark"
    >
      {isPending ? <Spinner /> : <XMarkIcon />}
    </button>
  );
}
