import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";

import type { noteCardFindService } from "@/_shared/note/services/noteCardFindService";
import { Card } from "@/_shared/ui/Card";
import { UserIcon } from "@/_shared/user/components/UserIcon";
import { cn } from "@/_shared/utils/cn";

import { AttachmentImages } from "./AttachmentImages";
import { DeleteButton } from "./DeleteButton";
import { LikeButton } from "./LikeButton";
import { NoteMenu } from "./NoteMenu";
import { PublishedAt } from "./PublishedAt";
import { ReplyButton } from "./ReplyButton";
import { RepostButton } from "./RepostButton";

export type NoteCardProps = {
  note: noteCardFindService.NoteCard;
  onLike: () => Promise<void>;
  onRepost: () => Promise<void>;
  onDelete: () => Promise<void>;
  showDetail?: boolean;
  withReplyLink?: boolean;
};

export function NoteCard({
  note,
  onLike,
  onRepost,
  onDelete,
  showDetail,
  withReplyLink,
}: NoteCardProps) {
  return (
    <Card
      as="article"
      data-testid={note.quotedBy ? "reposted-note-card" : "note-card"}
      className={cn("relative space-y-2", {
        "space-y-4": showDetail,
      })}
    >
      {note.quotedBy && (
        <div className="flex items-center pl-[48px]">
          <ArrowPathIcon className="absolute left-8 h-5 text-primary" />
          <Link href={note.quotedBy.url} className="hover:underline">
            {note.quotedBy.name ?? note.quotedBy.preferredUsername}さん
          </Link>
          がリポストしました
        </div>
      )}
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
              <span>{note.user.displayUsername}</span>
            </Link>
            <PublishedAt href={note.url} publishedAt={note.publishedAt} />
          </div>
          <div
            className={cn("break-words", { "text-xl": showDetail })}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(note.content) }}
          ></div>
          <AttachmentImages urls={note.attachmentUrls} />
        </div>
      </div>
      <footer className="space-y-2 pl-[48px]">
        <div className="flex gap-10">
          <ReplyButton url={note.url} />
          <RepostButton isReposted={note.isReposted} onClick={onRepost} />
          <LikeButton
            isLiked={note.isLiked}
            likesCount={note.likesCount}
            onClick={onLike}
          />
          {note.isMine && <DeleteButton onClick={onDelete} />}
          <NoteMenu noteId={note.id} />
        </div>
        {withReplyLink && (
          <Link className="block hover:underline" href={`/notes/${note.id}`}>
            返信を表示
          </Link>
        )}
      </footer>
    </Card>
  );
}
