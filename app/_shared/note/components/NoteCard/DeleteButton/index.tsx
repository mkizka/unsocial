"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

import { Button } from "@/_shared/ui/Button";
import { Spinner } from "@/_shared/ui/Spinner";

type Props = {
  onClick: () => Promise<void>;
};

export function DeleteButton({ onClick }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      data-testid="delete-button"
      onClick={() => {
        startTransition(onClick);
        location.reload();
      }}
    >
      {isPending ? (
        <Spinner className="size-4 text-destructive transition-colors" />
      ) : (
        <XMarkIcon className="size-5 text-destructive transition-colors" />
      )}
    </Button>
  );
}
