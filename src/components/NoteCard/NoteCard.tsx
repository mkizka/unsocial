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
      className="flex text-prmary bg-primary-light rounded p-4 mb-4 shadow"
    >
      <div className="mr-2">
        <Link href={href}>
          <Image
            className="rounded-full"
            src={
              note.user.icon ??
              `https://${env.HOST}/icon.png?name=${note.user.preferredUsername}`
            }
            width={50}
            height={50}
            alt={`@${note.user.preferredUsername}のアイコン`}
          />
        </Link>
      </div>
      <div className="w-full">
        <div className="flex mb-2">
          <div>
            <Link href={href} className="hover:underline">
              @{note.user.preferredUsername}
            </Link>
          </div>
          <div className="flex gap-2 ml-auto items-center">
            {isMine && <DeleteButton noteId={note.id} />}
            <LikeButton noteId={note.id} isLiked={isLiked} />
            <CreatedAt href={`/notes/${note.id}`} createdAt={note.createdAt} />
          </div>
        </div>
        <div
          className="mb-2"
          dangerouslySetInnerHTML={{ __html: note.content }}
        ></div>
      </div>
    </article>
  );
}
