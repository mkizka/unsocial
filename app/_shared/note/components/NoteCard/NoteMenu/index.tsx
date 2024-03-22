"use client";
import { Bars3Icon, HeartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/_shared/ui/Button";
import { Card } from "@/_shared/ui/Card";

type Props = {
  noteId: string;
};

export function NoteMenu({ noteId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const items = [
    {
      label: "いいねしたユーザー",
      href: `/notes/${noteId}/likes`,
      Icon: HeartIcon,
    },
  ];
  return (
    <div className="relative ml-auto size-9">
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? (
          <XMarkIcon className="size-5 transition-colors" />
        ) : (
          <Bars3Icon className="size-5 transition-colors" />
        )}
      </Button>
      {isOpen && (
        <>
          <Card
            className="absolute right-0 z-10 w-56 space-y-4 drop-shadow-xl"
            data-testid="note-menu__dropdown"
          >
            {items.map(({ label, href, Icon }) => (
              <Link
                key={label}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 hover:opacity-70"
                href={href}
              >
                <div className="flex size-5 items-center justify-center">
                  <Icon />
                </div>
                <div className="flex-1 truncate">{label}</div>
              </Link>
            ))}
          </Card>
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsOpen(false)}
            data-testid="note-menu__backdrop"
          />
        </>
      )}
    </div>
  );
}
