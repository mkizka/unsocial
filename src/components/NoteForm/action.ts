import { activityStreams } from "@/utils/activitypub";
import { getServerSession } from "@/utils/getServerSession";
import { prisma } from "@/utils/prisma";
import { relayActivity } from "@/utils/relayActivity";

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
  const note = await prisma.note.create({
    data: {
      userId: session.user.id,
      content,
      published: new Date(),
    },
  });
  relayActivity({
    sender: session.user,
    activity: activityStreams.create(note),
  });
}
