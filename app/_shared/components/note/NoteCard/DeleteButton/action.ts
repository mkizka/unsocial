"use server";
import { redirect } from "next/navigation";

import { activityStreams } from "@/_shared/utils/activitypub";
import { getServerSession } from "@/_shared/utils/getServerSession";
import { prisma } from "@/_shared/utils/prisma";
import { relayActivityToFollowers } from "@/_shared/utils/relayActivity";

export async function action(noteId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    // TODO: エラーを返す方法が実装されたら修正
    return;
  }
  // TODO: 自分のじゃなかったらエラー吐く
  await prisma.note.delete({ where: { id: noteId } });
  await relayActivityToFollowers({
    userId: session.user.id,
    activity: activityStreams.delete({
      id: noteId,
      userId: session.user.id,
    }),
  });
  redirect("/");
}
