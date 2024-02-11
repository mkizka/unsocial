"use server";
import { z } from "zod";

import { apRelayService } from "@/_shared/activitypub/apRelayService";
import { userSessionService } from "@/_shared/user/services/userSessionService";
import { activityStreams } from "@/_shared/utils/activitypub";
import { prisma } from "@/_shared/utils/prisma";

const formSchame = z.object({
  content: z.string().min(1).max(280),
  replyToId: z.string().optional(),
});

export async function action(formData: FormData) {
  const userId = await userSessionService.getUserId({ redirect: true });
  const parsedForm = formSchame.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsedForm.success) {
    return { error: "フォームの内容が不正です" };
  }
  const note = await prisma.note.create({
    data: {
      userId,
      content: parsedForm.data.content,
      replyToId: parsedForm.data.replyToId,
      publishedAt: new Date(),
    },
    include: {
      replyTo: {
        include: {
          user: true,
        },
      },
    },
  });
  if (note.replyTo?.user.inboxUrl) {
    await apRelayService.relayActivityToInboxUrl({
      userId,
      activity: activityStreams.create(note),
      inboxUrl: new URL(note.replyTo.user.inboxUrl),
    });
  }
  await apRelayService.relayActivityToFollowers({
    userId,
    activity: activityStreams.create(note),
  });
}
