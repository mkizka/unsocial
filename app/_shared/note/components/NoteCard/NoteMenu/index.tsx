"use client";
import { Bars3Icon, HeartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { Button } from "@/_shared/ui/Button";
import { Card } from "@/_shared/ui/Card";

type Props = {
  noteId: string;
};

type MenuItem = {
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
} & (
  | {
      href: string;
    }
  | {
      onClick: () => void;
    }
);

function NoteMenuItem(item: MenuItem) {
  if ("href" in item) {
    return (
      <a href={item.href} className="flex items-center gap-2 hover:opacity-70">
        <item.Icon className="size-5" />
        <div>{item.label}</div>
      </a>
    );
  }
  return (
    <button
      className="flex items-center gap-2 hover:opacity-70"
      onClick={item.onClick}
    >
      <item.Icon className="size-5" />
      <div>{item.label}</div>
    </button>
  );
}

export function NoteMenu({ noteId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const items: MenuItem[] = [
    {
      label: "いいねしたアカウント",
      href: `/notes/${noteId}/likes`,
      Icon: HeartIcon,
    },
  ];
  return (
    <div className="relative size-9">
      <Button
        variant="ghost"
        size="icon"
        data-testid="like-button"
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
            {items.map((item) => (
              <NoteMenuItem key={item.label} {...item} />
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
