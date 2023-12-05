import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { env } from "@/app/_shared/libs/util/env";
import { userService } from "@/server/service/user";
import { activityStreams } from "@/utils/activitypub";
import { prisma } from "@/utils/prisma";

export async function GET(
  _: Request,
  { params }: { params: { userKey: string } },
) {
  const user = await userService.findOrFetchUserByKey(params.userKey);
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
      id: `https://${env.HOST}/users/${user.id}/collections/featured`,
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
