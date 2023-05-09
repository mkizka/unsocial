import type { Like, Note, User } from "@prisma/client";

import { getServerSession } from "@/utils/getServerSession";

import { action } from "./parts/LikeButton";
import { LikeButton } from "./parts/LikeButton/component";

type Props = {
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

  async function handleLikeClick() {
    "use server";
    await action({ noteId: note.id, content: "👍" });
  }

  return (
    <article data-testid="note-card">
      <p>
        {note.user.name}
        <span>@{note.user.preferredUsername}</span>
        <span>@{note.user.host}</span>
      </p>
      <div dangerouslySetInnerHTML={{ __html: note.content }}></div>
      <LikeButton isLiked={isLiked} onClick={handleLikeClick} />
      {/*{isMine && <DeleteButton noteId={note.id} />}
      <LikeDetail noteId={note.id} />
      <Link data-testid="note-card-link" href={`/notes/${note.id}`}>
        {note.createdAt.toString()}
      </Link> */}
    </article>
  );
}
