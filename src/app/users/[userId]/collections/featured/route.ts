import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { prisma } from "@/server/prisma";
import { activityStreams } from "@/utils/activitypub";
import { env } from "@/utils/env";
import { findOrFetchUserByParams } from "@/utils/findOrFetchUser";

export async function GET(
  _: Request,
  { params }: { params: { userId: string } }
) {
  const user = await findOrFetchUserByParams(params);
  if (!user) {
    notFound();
  }
  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
    },
    take: 5,
  });
  // TODO: activityStreams.orderedCollection実装
  return NextResponse.json({
    "@context": ["https://www.w3.org/ns/activitystreams"],
    id: `https://${env.HOST}/users/${user.id}/collections/featured`,
    type: "OrderedCollection",
    totalItems: notes.length,
    orderedItems: notes.map(activityStreams.note),
  });
}
