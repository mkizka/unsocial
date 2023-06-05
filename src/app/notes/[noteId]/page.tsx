import { notFound } from "next/navigation";

import { NoteCard } from "@/components/NoteCard";
import { UserList } from "@/components/UserList";
import { prisma } from "@/utils/prisma";

export default async function NotePage({
  params,
}: {
  params: { noteId: string };
}) {
  const note = await prisma.note.findUnique({
    where: { id: params.noteId },
    include: {
      user: true,
      likes: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!note) {
    return notFound();
  }
  return (
    <main className="pt-5">
      <NoteCard note={note} />
      <UserList users={note.likes.map((like) => like.user)} />
    </main>
  );
}
