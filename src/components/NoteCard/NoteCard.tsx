import type { Like, Note, User } from "@prisma/client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { FC } from "react";

import { DeleteButton } from "./parts/DeleteButton";
import { LikeButton } from "./parts/LikeButton";

type Props = {
  note: Note & {
    user: Pick<User, "name" | "preferredUsername" | "host">;
    likes: Like[];
  };
};

export const NoteCard: FC<Props> = ({ note }) => {
  const { data: sessionData } = useSession();
  const userId = sessionData?.user?.id;
  const isMine = userId === note.userId;
  const isLiked = note.likes.some((like) => like.userId === userId);
  return (
    <Link data-testid="NoteCard" href={`/notes/${note.id}`}>
      <div>
        <p>
          {note.user.name}
          <span>@{note.user.preferredUsername}</span>
          <span>@{note.user.host}</span>
        </p>
        <p>{note.content}</p>
        <LikeButton noteId={note.id} isLiked={isLiked} />
        {isMine && <DeleteButton noteId={note.id} />}
      </div>
    </Link>
  );
};
