import type { Like, Note, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { env } from "@/utils/env";
import { getServerSession } from "@/utils/getServerSession";

import { CreatedAt } from "./parts/CreatedAt";
import { DeleteButton } from "./parts/DeleteButton";
import { LikeButton } from "./parts/LikeButton";

export type Props = {
  note: Note & {
    user: Pick<User, "name" | "preferredUsername" | "host" | "icon">;
    likes: Pick<Like, "userId">[];
  };
};

export async function NoteCard({ note }: Props) {
  const session = await getServerSession();
  const userId = session?.user?.id;
  const isMine = userId === note.userId;
  const isLiked = note.likes.some((like) => like.userId === userId);
  const href =
    `/@${note.user.preferredUsername}` +
    (note.user.host != env.HOST ? `@${note.user.host}` : "");

  return (
    <article
      data-testid="note-card"
      className="flex relative text-prmary bg-primary-light rounded pt-3 pl-3 pr-4 pb-5 mb-2 shadow"
    >
      <div className="w-full pl-[48px]">
        <Link className="absolute left-3" href={href}>
          <Image
            className="rounded-full"
            src={`/icon?preferredUsername=${note.user.preferredUsername}&host=${note.user.host}`}
            width={36}
            height={36}
            alt={`@${note.user.preferredUsername}のアイコン`}
          />
        </Link>
        <div className="flex">
          <Link href={href} className="block truncate hover:underline">
            {note.user.name && <span className="mr-1">{note.user.name}</span>}
            <span className="text-gray">
              @{note.user.preferredUsername}@{note.user.host}
            </span>
          </Link>
          <div className="flex gap-1 ml-auto pl-1 items-center">
            {isMine && <DeleteButton noteId={note.id} />}
            <LikeButton noteId={note.id} isLiked={isLiked} />
            <CreatedAt href={`/notes/${note.id}`} createdAt={note.createdAt} />
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: note.content }}></div>
      </div>
    </article>
  );
}
