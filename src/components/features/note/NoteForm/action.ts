"use server";
import { noteService } from "@/server/service";
import { activityStreams } from "@/utils/activitypub";
import { getServerSession } from "@/utils/getServerSession";
import { relayActivityToFollowers } from "@/utils/relayActivity";

export async function action(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user) {
    // TODO: エラーを返す方法が実装されたら修正
    return { error: "ログインが必要です" };
  }
  const content = formData.get("content");
  if (typeof content !== "string") {
    return { error: "入力したデータが不正です" };
  }
  const note = await noteService.create({
    userId: session.user.id,
    content,
    publishedAt: new Date(),
  });
  await relayActivityToFollowers({
    userId: session.user.id,
    activity: activityStreams.create(note),
  });
  return note;
}
