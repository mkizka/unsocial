"use client";

import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type Props = {
  url: string;
};

export function ReplyButton({ url }: Props) {
  return (
    <Link href={url + "?reply"} data-testid="note-card__reply">
      <ChatBubbleLeftIcon className="size-5 text-dark transition-colors hover:text-gray" />
    </Link>
  );
}
