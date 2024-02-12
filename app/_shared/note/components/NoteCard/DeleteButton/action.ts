"use server";

import { apRelayService } from "@/_shared/activitypub/apRelayService";
import { userSessionService } from "@/_shared/user/services/userSessionService";
import { activityStreams } from "@/_shared/utils/activitypub";
import { prisma } from "@/_shared/utils/prisma";

export async function action(noteId: string) {
  const userId = await userSessionService.getUserId({ redirect: true });
  await prisma.note.delete({
    where: {
      id: noteId,
      // ログインユーザーのノートで無ければ失敗する
      userId,
    },
  });
  await apRelayService.relay({
    userId,
    activity: activityStreams.delete({
      id: noteId,
      userId,
    }),
  });
}
