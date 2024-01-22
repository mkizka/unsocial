"use client";

import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { Button } from "@/_shared/ui/Button";

type Props = {
  url: string;
};

export function ReplyButton({ url }: Props) {
  return (
    <Link href={url + "?reply"} data-testid="note-card__reply">
      <Button variant="ghost" size="icon" type="button">
        <ChatBubbleLeftIcon className="size-5 transition-colors" />
      </Button>
    </Link>
  );
}
