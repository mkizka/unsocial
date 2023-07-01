import Link from "next/link";

import type { noteService } from "@/server/service";

import { UserIcon } from "../UserIcon";
import { CreatedAt } from "./parts/CreatedAt";
import { DeleteButton } from "./parts/DeleteButton";
import { LikeButton } from "./parts/LikeButton";

export type Props = {
  note: noteService.NoteCard;
};

export async function NoteCard({ note }: Props) {
  return (
    <article
      data-testid="note-card"
      className="flex relative text-prmary bg-primary-light rounded pt-3 pl-3 pr-4 pb-5 mb-2 shadow"
    >
      <div className="w-full pl-[48px]">
        <Link className="absolute left-3" href={note.url}>
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
          <div className="flex gap-1 ml-auto pl-1 items-center">
            {note.isMine && <DeleteButton noteId={note.id} />}
            <LikeButton noteId={note.id} isLiked={note.isLiked} />
            <CreatedAt href={note.url} createdAt={note.createdAt} />
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: note.content }}></div>
      </div>
    </article>
  );
}
