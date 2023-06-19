import { logger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";

export async function action(userId: string) {
  const { count } = await prisma.user.updateMany({
    where: {
      id: userId,
      // 連打されたときにリクエストが連続しないように、10秒以上経過したユーザーのみ更新する
      lastFetchedAt: {
        lte: new Date(Date.now() - 1000 * 10),
      },
    },
    data: { lastFetchedAt: null },
  });
  if (count == 0) {
    logger.info("ユーザー情報の再取得が行われませんでした");
  }
}
