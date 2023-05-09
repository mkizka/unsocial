import { notFound } from "next/navigation";

import { NoteCard } from "@/components/NoteCard";
import { prisma } from "@/server/prisma";

export default async function NotePage({
  params,
}: {
  params: { noteId: string };
}) {
  const note = await prisma.note.findUnique({
    where: { id: params.noteId },
    include: {
      user: {
        select: {
          name: true,
          preferredUsername: true,
          host: true,
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
    },
  });
  if (!note) {
    return notFound();
  }
  // @ts-expect-error
  return <NoteCard note={note} />;
}
