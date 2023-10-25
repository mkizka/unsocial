import Link from "next/link";

import { UserIcon } from "@/components/features/user/UserIcon";
import type { noteService } from "@/server/service";

import { AttachmentImages } from "./parts/AttachmentImages";
import { DeleteButton } from "./parts/DeleteButton";
import { LikeButton } from "./parts/LikeButton";
import { PublishedAt } from "./parts/PublishedAt";

export type Props = {
  note: noteService.NoteCard;
};

export function NoteCard({ note }: Props) {
  return (
    <article
      data-testid="note-card"
      className="text-prmary relative mb-1 flex rounded bg-primary-light p-4 shadow"
    >
      <div className="w-full pl-[48px]">
        <Link className="absolute left-3" href={note.user.url}>
          <UserIcon user={note.user} className="rounded-full" size={36} />
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
        {/* TODO: 複数枚画像に対応する */}
        {note.attachmentUrl && <AttachmentImages url={note.attachmentUrl} />}
      </div>
    </article>
  );
}
