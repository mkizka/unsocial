"use server";
import { z } from "zod";

import { activityStreams } from "@/_shared/utils/activitypub";
import { prisma } from "@/_shared/utils/prisma";
import {
  relayActivityToFollowers,
  relayActivityToInboxUrl,
} from "@/_shared/utils/relayActivity";
import { getSessionUserId } from "@/_shared/utils/session";

const formSchame = z.object({
  content: z.string().min(1).max(280),
  replyToId: z.string().optional(),
});

export async function action(formData: FormData) {
  const userId = await getSessionUserId({ redirect: true });
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
    await relayActivityToInboxUrl({
      userId,
      activity: activityStreams.create(note),
      inboxUrl: new URL(note.replyTo.user.inboxUrl),
    });
  }
  await relayActivityToFollowers({
    userId,
    activity: activityStreams.create(note),
  });
}
