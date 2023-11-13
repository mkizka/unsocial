"use server";
import { z } from "zod";

import { noteService } from "@/server/service";
import { activityStreams } from "@/utils/activitypub";
import { getServerSession } from "@/utils/getServerSession";
import { relayActivityToFollowers } from "@/utils/relayActivity";

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
  await relayActivityToFollowers({
    userId: session.user.id,
    activity: activityStreams.create(note),
  });
}
