"use server";

import { apReplayService } from "@/_shared/activitypub/apRelayService";
import { userSessionService } from "@/_shared/user/services/userSessionService";
import { activityStreams } from "@/_shared/utils/activitypub";
import { prisma } from "@/_shared/utils/prisma";

export async function action(noteId: string) {
  const userId = await userSessionService.getUserId({ redirect: true });
  // TODO: 自分のじゃなかったらエラー吐く
  await prisma.note.delete({ where: { id: noteId } });
  await apReplayService.relayActivityToFollowers({
    userId,
    activity: activityStreams.delete({
      id: noteId,
      userId,
    }),
  });
}
