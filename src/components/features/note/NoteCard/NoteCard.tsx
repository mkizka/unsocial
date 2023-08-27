import Link from "next/link";
import type { Ref } from "react";
import { forwardRef } from "react";

import { UserIcon } from "@/components/features/user/UserIcon";
import type { noteService } from "@/server/service";

import { DeleteButton } from "./parts/DeleteButton";
import { LikeButton } from "./parts/LikeButton";
import { PublishedAt } from "./parts/PublishedAt";

export type Props = {
  note: noteService.NoteCard;
};

function _NoteCard({ note }: Props, ref: Ref<HTMLDivElement>) {
  return (
    <article
      ref={ref}
      data-testid="note-card"
      className="text-prmary relative mb-2 flex rounded bg-primary-light pb-5 pl-3 pr-4 pt-3 shadow"
    >
      <div className="w-full pl-[48px]">
        <Link className="absolute left-3" href={note.user.url}>
          <UserIcon
            user={note.user}
            className="rounded-full"
            width={36}
            height={36}
          />
        </Link>
        <div className="flex">
          <Link href={note.user.url} className="block truncate hover:underline">
            {note.user.name && <span className="mr-1">{note.user.name}</span>}
            <span className="text-gray">{note.user.displayUsername}</span>
          </Link>
          <div className="ml-auto flex items-center gap-1 pl-1">
            {note.isMine && <DeleteButton noteId={note.id} />}
            <LikeButton noteId={note.id} isLiked={note.isLiked} />
            <PublishedAt href={note.url} publishedAt={note.publishedAt} />
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: note.content }}></div>
      </div>
    </article>
  );
}

export const NoteCard = forwardRef(_NoteCard);
