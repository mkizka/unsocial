"use client";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useTransition } from "react";

import { Spinner } from "@/components/clients/Spinner";

import { action } from "./action.server";

type Props = {
  userId: string;
};

export function RefetchButton({ userId }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="flex h-6 w-6 items-center justify-center"
      onClick={() => startTransition(() => action(userId))}
    >
      {isPending ? <Spinner /> : <ArrowPathIcon />}
    </button>
  );
}
