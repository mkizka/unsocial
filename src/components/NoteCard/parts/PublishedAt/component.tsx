"use client";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";

import { format } from "./utils";

type Props = {
  href: string;
  publishedAt: Date;
};

// TODO: レイアウトシフトしないようにしたい
export function PublishedAt({ href, publishedAt }: Props) {
  const [text, setText] = useState("");

  useLayoutEffect(() => {
    const updateText = () => {
      const nextText = format(publishedAt);
      if (text !== nextText) {
        setText(nextText);
      }
    };
    const intervalId = setInterval(updateText, 2000);
    updateText();
    return () => clearInterval(intervalId);
  }, [publishedAt, text]);

  return (
    <Link
      data-testid="note-card__link"
      href={href}
      className="w-fit whitespace-nowrap hover:underline"
    >
      {text}
    </Link>
  );
}
