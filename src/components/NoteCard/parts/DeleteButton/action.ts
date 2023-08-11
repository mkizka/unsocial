import { activityStreams } from "@/utils/activitypub";
import { getServerSession } from "@/utils/getServerSession";
import { prisma } from "@/utils/prisma";
import { relayActivityToFollowers } from "@/utils/relayActivity";

export async function action(noteId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    // TODO: エラーを返す方法が実装されたら修正
    return { error: "ログインが必要です" };
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
}
