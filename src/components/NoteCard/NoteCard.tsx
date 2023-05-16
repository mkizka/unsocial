import type { Like, Note, User } from "@prisma/client";
import Link from "next/link";

import { getServerSession } from "@/utils/getServerSession";

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
    <article data-testid="note-card">
      <p>
        {note.user.name}
        <span>@{note.user.preferredUsername}</span>
        <span>@{note.user.host}</span>
      </p>
      <div dangerouslySetInnerHTML={{ __html: note.content }}></div>
      <LikeButton noteId={note.id} isLiked={isLiked} />
      {isMine && <DeleteButton noteId={note.id} />}
      <Link data-testid="note-card__link" href={`/notes/${note.id}`}>
        {note.createdAt.toString()}
      </Link>
    </article>
  );
}
