import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { activityStreams } from "@/_shared/utils/activitypub";
import { prisma } from "@/_shared/utils/prisma";

export async function GET(
  _: Request,
  { params: { noteId } }: { params: { noteId: string } },
) {
  const note = await prisma.note.findFirst({
    select: {
      id: true,
      userId: true,
      content: true,
      publishedAt: true,
      replyTo: {
        select: {
          id: true,
          url: true,
          user: {
            select: {
              actorUrl: true,
            },
          },
        },
      },
    },
    where: { id: noteId },
  });
  if (!note) {
    notFound();
  }
  return NextResponse.json(activityStreams.note(note), {
    headers: {
      "Content-Type": "application/activity+json",
      "Cache-Control": "max-age=0, s-maxage=60",
    },
  });
}
