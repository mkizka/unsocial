"use client";

import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type Props = {
  url: string;
};

export function ReplyButton({ url }: Props) {
  return (
    <Link href={url + "?reply"}>
      <ChatBubbleLeftIcon className="h-5 w-5 text-dark transition-colors hover:text-gray" />
    </Link>
  );
}
