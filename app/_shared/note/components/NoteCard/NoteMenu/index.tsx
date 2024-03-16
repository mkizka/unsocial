"use client";
import { Bars3Icon, HeartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { Button } from "@/_shared/ui/Button";
import { Card } from "@/_shared/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_shared/ui/Dialog";

type Props = {
  noteId: string;
};

function LikesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-70">
          <HeartIcon className="size-5" />
          <div>いいねしたユーザー</div>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>いいねしたユーザー</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export function NoteMenu({ noteId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative ml-auto size-9">
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
            <LikesDialog />
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
