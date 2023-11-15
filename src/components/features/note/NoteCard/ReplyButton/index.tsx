"use client";

import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  url: string;
};

function ReplyIcon() {
  return (
    <ChatBubbleLeftIcon className="h-5 w-5 text-dark transition-colors hover:text-gray" />
  );
}

export function ReplyButton({ url }: Props) {
  const searchParams = useSearchParams();
  if (searchParams.has("reply")) {
    return (
      <button type="button">
        <ReplyIcon />
      </button>
    );
  }
  return (
    <Link href={url + "?reply"}>
      <ReplyIcon />
    </Link>
  );
}
