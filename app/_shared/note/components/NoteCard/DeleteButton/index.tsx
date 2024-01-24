"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

import { Button } from "@/_shared/ui/Button";

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
      loading={isPending}
      className="text-destructive"
      onClick={() => {
        startTransition(onClick);
        location.reload();
      }}
    >
      <XMarkIcon className="size-5" />
    </Button>
  );
}
