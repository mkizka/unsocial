"use client";

import Link from "next/link";

function format(date: Date) {
  let diff = Math.ceil((new Date().getTime() - date.getTime()) / 1000);
  if (diff <= 60) return `${diff}秒前`;
  diff = Math.ceil(diff / 60);
  if (diff <= 60) return `${diff}分前`;
  diff = Math.ceil(diff / 60);
  if (diff <= 24) return `${diff}時間前`;
  diff = Math.ceil(diff / 24);
  return date.toLocaleDateString();
}

export function CreatedAt({
  href,
  createdAt,
}: {
  href: string;
  createdAt: Date;
}) {
  return (
    <Link data-testid="note-card__link" href={href} className="hover:underline">
      {format(createdAt)}
    </Link>
  );
}
