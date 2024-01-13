"use server";
import { redirect } from "next/navigation";

import { activityStreams } from "@/_shared/utils/activitypub";
import { prisma } from "@/_shared/utils/prisma";
import { relayActivityToFollowers } from "@/_shared/utils/relayActivity";
import { getSessionUserId } from "@/_shared/utils/session";

export async function action(noteId: string) {
  const userId = await getSessionUserId({ redirect: true });
  // TODO: 自分のじゃなかったらエラー吐く
  await prisma.note.delete({ where: { id: noteId } });
  await relayActivityToFollowers({
    userId,
    activity: activityStreams.delete({
      id: noteId,
      userId,
    }),
  });
  redirect("/");
}