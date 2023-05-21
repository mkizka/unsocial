"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function format(date: Date) {
  let diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (diff <= 60) return `${diff}秒前`;
  diff = Math.floor(diff / 60);
  if (diff <= 60) return `${diff}分前`;
  diff = Math.floor(diff / 60);
  if (diff <= 24) return `${diff}時間前`;
  diff = Math.floor(diff / 24);
  return date.toLocaleDateString();
}

export function CreatedAt({
  href,
  createdAt,
}: {
  href: string;
  createdAt: Date;
}) {
  const [createdAtText, setCreatedAtText] = useState(format(createdAt));
  useEffect(() => {
    const timer = setInterval(() => {
      setCreatedAtText(format(createdAt));
    }, 30000);
    return () => clearInterval(timer);
  });
  return (
    <Link data-testid="note-card__link" href={href} className="hover:underline">
      {createdAtText}
    </Link>
  );
}
