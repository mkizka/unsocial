"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

import { Spinner } from "@/_shared/components/ui/Spinner";

type Props = {
  onClick: () => Promise<void>;
};

export function DeleteButton({ onClick }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      data-testid="delete-button"
      onClick={() => startTransition(onClick)}
      className="h-5 w-5 text-accent transition-colors hover:text-accent-dark"
    >
      {isPending ? <Spinner /> : <XMarkIcon />}
    </button>
  );
}
