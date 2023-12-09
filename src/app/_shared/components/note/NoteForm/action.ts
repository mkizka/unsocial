"use server";
import { z } from "zod";

import { noteService } from "@/app/_shared/service";
import { activityStreams } from "@/app/_shared/utils/activitypub";
import { getServerSession } from "@/app/_shared/utils/getServerSession";
import {
  relayActivityToFollowers,
  relayActivityToInboxUrl,
} from "@/app/_shared/utils/relayActivity";

const formSchame = z.object({
  content: z.string().min(1).max(280),
  replyToId: z.string().optional(),
});

export async function action(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user) {
    // TODO: エラーを返す方法が実装されたら修正
    return { error: "ログインが必要です" };
  }
  const parsedForm = formSchame.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsedForm.success) {
    return { error: "フォームの内容が不正です" };
  }
  const note = await noteService.create({
    userId: session.user.id,
    content: parsedForm.data.content,
    replyToId: parsedForm.data.replyToId,
    publishedAt: new Date(),
    attachments: [],
  });
  if (note.replyTo?.user.inboxUrl) {
    await relayActivityToInboxUrl({
      userId: session.user.id,
      activity: activityStreams.create(note),
      inboxUrl: new URL(note.replyTo.user.inboxUrl),
    });
  }
  await relayActivityToFollowers({
    userId: session.user.id,
    activity: activityStreams.create(note),
  });
}
