import type { Like, Note, User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServerSession } from "@/utils/getServerSession";

import { action as deleteAction, DeleteButton } from "./parts/DeleteButton";
import { action as likeAction, LikeButton } from "./parts/LikeButton";

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
    await likeAction({ noteId: note.id, content: "👍" });
    revalidatePath(`/notes/${note.id}`);
  }

  async function handleDeleteClick() {
    "use server";
    await deleteAction({ noteId: note.id });
    redirect("/");
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
      {isMine && <DeleteButton onClick={handleDeleteClick} />}
      {/*<LikeDetail noteId={note.id} />
      <Link data-testid="note-card-link" href={`/notes/${note.id}`}>
        {note.createdAt.toString()}
      </Link> */}
    </article>
  );
}
