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
    user: Pick<User, "name" | "preferredUsername" | "host">;
    likes: Pick<Like, "userId">[];
  };
};

export async function NoteCard({ note }: Props) {
  const session = await getServerSession();
  const userId = session?.user?.id;
  const isMine = userId === note.userId;
  const isLiked = note.likes.some((like) => like.userId === userId);

  return (
    <article
      data-testid="note-card"
      className="flex text-prmary bg-white rounded-lg p-4 mb-4 shadow"
    >
      <div className="mr-2">
        <Image
          className="h-10 w-10 rounded-full"
          src={`https://ui-avatars.com/api/?name=@${note.user.preferredUsername}@${note.user.host}`}
          width={50}
          height={50}
          alt={`@${note.user.name}のアイコン`}
        />
      </div>
      <div className="w-full">
        <div className="flex">
          <div>
            <Link
              href={
                `/@${note.user.preferredUsername}` +
                (note.user.host != env.HOST ? `@${note.user.host}` : "")
              }
            >
              @{note.user.preferredUsername}@{note.user.host}
            </Link>
          </div>
          <div className="flex gap-2 ml-auto items-center">
            {isMine && <DeleteButton noteId={note.id} />}
            <LikeButton noteId={note.id} isLiked={isLiked} />
            <Link data-testid="note-card__link" href={`/notes/${note.id}`}>
              <CreatedAt createdAt={note.createdAt} />
            </Link>
          </div>
        </div>
        <div>
          <p>{note.content}</p>
        </div>
      </div>
    </article>
  );
}
