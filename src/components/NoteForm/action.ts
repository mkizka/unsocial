"use server";

import { NextResponse } from "next/server";

import { queue } from "@/server/background/queue";
import { prisma } from "@/server/prisma";
import { activityStreams } from "@/utils/activitypub";
import { getServerSession } from "@/utils/getServerSession";

export async function action(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user) {
    // TODO: いいのかこれ
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const content = formData.get("content");
  if (typeof content !== "string") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
  const note = await prisma.note.create({
    data: {
      userId: session.user.id,
      content,
      published: new Date(),
    },
  });
  queue.push({
    runner: "relayActivity",
    params: {
      sender: session.user,
      activity: activityStreams.create(note),
    },
  });
}
