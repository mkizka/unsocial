"use client";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";

import { format } from "./utils";

type Props = {
  href: string;
  initialText: string;
  createdAt: Date;
};

export function Client({ href, initialText, createdAt }: Props) {
  const [createdAtText, setCreatedAtText] = useState(initialText);

  useLayoutEffect(() => {
    const timer = setInterval(() => {
      setCreatedAtText(format(createdAt));
    }, 2000);
    return () => clearInterval(timer);
  }, [createdAt]);

  return (
    <Link
      data-testid="note-card__link"
      href={href}
      className="w-fit whitespace-nowrap hover:underline"
    >
      {createdAtText}
    </Link>
  );
}
