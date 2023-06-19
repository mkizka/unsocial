import { prisma } from "@/utils/prisma";

export async function action(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastFetchedAt: null },
  });
}
