import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { userFindService } from "@/_shared/user/services/userFindService";
import { activityStreams } from "@/_shared/utils/activitypub";
import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

export async function GET(
  _: Request,
  { params }: { params: { userKey: string } },
) {
  const user = await userFindService.findOrFetchUserByKey(params.userKey);
  if (user instanceof Error) {
    notFound();
  }
  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
    },
    take: 5,
  });
  // TODO: activityStreams.orderedCollection実装
  return NextResponse.json(
    {
      "@context": ["https://www.w3.org/ns/activitystreams"],
      id: `https://${env.UNSOCIAL_HOST}/users/${user.id}/collections/featured`,
      type: "OrderedCollection",
      totalItems: notes.length,
      orderedItems: notes.map(activityStreams.note),
    },
    {
      headers: {
        "Content-Type": "application/activity+json",
      },
    },
  );
}
