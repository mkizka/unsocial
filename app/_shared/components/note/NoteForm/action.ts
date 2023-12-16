"use server";
import { z } from "zod";

import { noteService } from "@/_shared/service";
import { activityStreams } from "@/_shared/utils/activitypub";
import { getSessionUserId } from "@/_shared/utils/getSessionUser";
import {
  relayActivityToFollowers,
  relayActivityToInboxUrl,
} from "@/_shared/utils/relayActivity";

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
  const note = await noteService.create({
    userId,
    content: parsedForm.data.content,
    replyToId: parsedForm.data.replyToId,
    publishedAt: new Date(),
    attachments: [],
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
