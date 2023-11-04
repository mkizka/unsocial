import Link from "next/link";

import { UserIcon } from "@/components/features/user/UserIcon";
import { Card } from "@/components/ui/Card";
import type { noteService } from "@/server/service";

import { AttachmentImages } from "./parts/AttachmentImages";
import { DeleteButton } from "./parts/DeleteButton";
import { LikeButton } from "./parts/LikeButton";
import { PublishedAt } from "./parts/PublishedAt";
import { ReplyButton } from "./parts/ReplyButton";

export type Props = {
  note: noteService.NoteCard;
};

export function NoteCard({ note }: Props) {
  return (
    <Card
      as="article"
      data-testid="note-card"
      className="text-prmary relative mb-1 flex p-4 "
    >
      <div className="w-full pl-[48px]">
        <Link className="absolute left-3" href={note.user.url}>
          <UserIcon user={note.user} className="rounded-full" size={36} />
        </Link>
        <div className="flex">
          <Link href={note.user.url} className="truncate hover:underline">
            {note.user.name && <span className="mr-1">{note.user.name}</span>}
            <span className="text-gray">{note.user.displayUsername}</span>
          </Link>
          <PublishedAt href={note.url} publishedAt={note.publishedAt} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: note.content }}></div>
        {/* TODO: 複数枚画像に対応する */}
        {note.attachmentUrl && <AttachmentImages url={note.attachmentUrl} />}
        <div className="mt-3 flex gap-10">
          <ReplyButton noteId={note.id} />
          <LikeButton noteId={note.id} isLiked={note.isLiked} />
          {note.isMine && <DeleteButton noteId={note.id} />}
        </div>
      </div>
    </Card>
  );
}
