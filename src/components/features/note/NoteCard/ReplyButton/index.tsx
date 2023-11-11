"use client";

import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  url: string;
};

export function ReplyButton({ url }: Props) {
  const pathname = usePathname();
  return (
    <Link href={pathname.startsWith("/notes/") ? "" : url + "?reply"}>
      <ChatBubbleLeftIcon className="h-5 w-5 text-dark transition-colors hover:text-gray" />
    </Link>
  );
}
