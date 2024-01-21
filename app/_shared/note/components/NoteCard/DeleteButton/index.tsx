"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

import { Spinner } from "@/_shared/ui/Spinner";

type Props = {
  onClick: () => Promise<void>;
};

export function DeleteButton({ onClick }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      data-testid="delete-button"
      onClick={() => startTransition(onClick)}
      className="size-5 text-accent transition-colors"
    >
      {isPending ? <Spinner /> : <XMarkIcon />}
    </button>
  );
}
