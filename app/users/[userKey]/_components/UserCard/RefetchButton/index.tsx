"use client";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

import { Spinner } from "@/_shared/ui/Spinner";

import { action } from "./action";

type Props = {
  userId: string;
};

export function RefetchButton({ userId }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="flex size-6 items-center justify-center"
      onClick={() => startTransition(() => action(userId))}
    >
      {isPending ? <Spinner /> : <ArrowPathIcon />}
    </button>
  );
}
