import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { prisma } from "@/server/prisma";
import { activityStreams } from "@/utils/activitypub";

export async function GET(
  _: Request,
  { params: { noteId } }: { params: { noteId: string } }
) {
  const note = await prisma.note.findFirst({
    select: {
      id: true,
      userId: true,
      content: true,
      createdAt: true,
    },
    where: { id: noteId },
  });
  if (!note) {
    notFound();
  }
  return NextResponse.json(activityStreams.note(note), {
    headers: {
      "Content-Type": "application/activity+json",
    },
  });
}
