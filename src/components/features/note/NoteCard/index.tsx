import Link from "next/link";

import { UserIcon } from "@/components/features/user/UserIcon";
import { Card } from "@/components/ui/Card";
import type { noteService } from "@/server/service";
import { cn } from "@/utils/cn";

import { AttachmentImages } from "./AttachmentImages";
import { DeleteButton } from "./DeleteButton";
import { LikeButton } from "./LikeButton";
import { PublishedAt } from "./PublishedAt";
import { ReplyButton } from "./ReplyButton";

export type Props = {
  note: noteService.NoteCard;
  showDetail?: boolean;
  withReplyLink?: boolean;
};

export function NoteCard({ note, showDetail, withReplyLink }: Props) {
  return (
    <Card
      as="article"
      data-testid="note-card"
      className={cn("text-prmary relative space-y-2 p-4", {
        "space-y-4": showDetail,
      })}
    >
      <div className="flex pl-[48px]">
        <Link className="absolute left-3" href={note.user.url}>
          <UserIcon user={note.user} className="rounded-full" size={36} />
        </Link>
        <div className={cn("w-full space-y-2", { "space-y-4": showDetail })}>
          <div className="flex">
            <Link href={note.user.url} className="truncate hover:underline">
              {note.user.name && (
                <span className="mr-1 font-bold">{note.user.name}</span>
              )}
              <span className="text-gray">{note.user.displayUsername}</span>
            </Link>
            <PublishedAt href={note.url} publishedAt={note.publishedAt} />
          </div>
          <div
            className={cn("break-words", { "text-xl": showDetail })}
            dangerouslySetInnerHTML={{ __html: note.content }}
          ></div>
          <AttachmentImages urls={note.attachmentUrls} />
        </div>
      </div>
      <footer className="mt-3 space-y-2 pl-[48px]">
        <div className="flex gap-10">
          <ReplyButton url={note.url} />
          <LikeButton noteId={note.id} isLiked={note.isLiked} />
          {note.isMine && <DeleteButton noteId={note.id} />}
        </div>
        {withReplyLink && (
          <Link
            className="block text-gray hover:underline"
            href={`/notes/${note.id}`}
          >
            返信を表示
          </Link>
        )}
      </footer>
    </Card>
  );
}
