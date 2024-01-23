"use client";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

import { Button } from "@/_shared/ui/Button";

import { action } from "./action";

type Props = {
  userId: string;
};

export function RefetchButton({ userId }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      loading={isPending}
      onClick={() => startTransition(() => action(userId))}
    >
      <ArrowPathIcon className="size-5" />
    </Button>
  );
}
